// Registering a birth against a pending breeding — offline-first via
// useOfflineEntity('breedingBirth').
//
// One request closes the pregnancy, creates an Animal per live offspring and
// logs the birth event; the backend does it in a transaction. Offspring uuids
// are minted here so a queued create replays without duplicating the litter.
//
// Like every other per-entity composable, this owns form state only.
import { db } from '../utils/db'
import type { BreedingRecord } from './useAnimalBreedings'

export interface OffspringForm {
  uuid: string
  tag_number: string
  name: string
  gender: 'male' | 'female' | 'unknown'
  animal_breed_id: number | string | ''
  notes: string
}

export interface OffspringErrors {
  tag_number?: string
  name?: string
  gender?: string
  animal_breed_id?: string
  notes?: string
}

type BirthFormErrorKey = 'birth_date' | 'stillborn_count' | 'offspring' | 'status'
type BirthValidationErrors = Partial<Record<BirthFormErrorKey, string>>

export const useBirthRegistration = (breeding: BreedingRecord, animalUuid: string) => {
  const breedingUuid = breeding.uuid ?? ''
  const resource = useOfflineEntity<Record<string, any>>('breedingBirth', { breedingUuid, animalUuid })

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const blankOffspring = (): OffspringForm => ({
    uuid: crypto.randomUUID(),
    tag_number: '',
    name: '',
    gender: 'unknown',
    animal_breed_id: '',
    notes: ''
  })

  const createDefaultForm = () => ({
    // Most births are recorded the day they happen, but never in the future.
    birth_date: today(),
    stillborn_count: 0,
    inherit_treatment_plan: true,
    offspring: [blankOffspring()]
  })

  const birthForm = ref(createDefaultForm())
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const formErrors = ref<BirthValidationErrors>({})
  const offspringErrors = ref<Record<number, OffspringErrors>>({})
  const errorList = ref<string[]>([])

  const liveCount = computed(() => birthForm.value.offspring.length)
  const stillbornCount = computed(() => Number(birthForm.value.stillborn_count) || 0)

  const summary = computed(() => {
    const parts = [`${liveCount.value} live`]
    if (stillbornCount.value > 0) parts.push(`${stillbornCount.value} stillborn`)
    return parts.join(', ')
  })

  const addOffspring = () => {
    birthForm.value.offspring.push(blankOffspring())
  }

  const removeOffspring = (index: number) => {
    birthForm.value.offspring.splice(index, 1)
    // Row indices shift, so stale per-row errors would point at the wrong row.
    offspringErrors.value = {}
  }

  const reset = () => {
    birthForm.value = createDefaultForm()
    submitting.value = false
    submitError.value = null
    formErrors.value = {}
    offspringErrors.value = {}
    errorList.value = []
  }

  /** Splits Laravel's dotted keys (`offspring.0.gender`) onto the right row. */
  const setValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
    const mapped: BirthValidationErrors = {}
    const rows: Record<number, OffspringErrors> = {}
    const list: string[] = []

    if (!errors) {
      formErrors.value = {}
      offspringErrors.value = {}
      errorList.value = []
      return
    }

    for (const [key, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value
      if (!message) continue
      list.push(message)

      const rowMatch = key.match(/^offspring\.(\d+)\.(\w+)$/)
      if (rowMatch) {
        const index = Number(rowMatch[1])
        rows[index] = { ...(rows[index] ?? {}), [rowMatch[2] as keyof OffspringErrors]: message }
        continue
      }

      mapped[key as BirthFormErrorKey] = message
    }

    formErrors.value = mapped
    offspringErrors.value = rows
    errorList.value = [...new Set(list)]
  }

  /**
   * The breeding row as it will look once this birth lands. Used to keep the
   * table honest while a birth is still sitting in the sync queue.
   */
  const optimisticBreeding = (): BreedingRecord => ({
    ...breeding,
    status: 'born',
    actual_birth_date: birthForm.value.birth_date,
    offspring_count: liveCount.value,
    stillborn_count: stillbornCount.value,
    offspring: birthForm.value.offspring.map(o => ({
      uuid: o.uuid,
      name: o.name || o.tag_number || null,
      tag_number: o.tag_number || null,
      gender: o.gender
    })),
    synced: false
  })

  const registerBirth = async (): Promise<{ ok: boolean; synced: boolean; breeding?: BreedingRecord }> => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    offspringErrors.value = {}
    errorList.value = []

    const payload = {
      birth_date: birthForm.value.birth_date || today(),
      stillborn_count: stillbornCount.value,
      inherit_treatment_plan: birthForm.value.inherit_treatment_plan,
      offspring: birthForm.value.offspring.map(o => ({
        uuid: o.uuid,
        tag_number: o.tag_number || null,
        name: o.name || null,
        gender: o.gender,
        animal_breed_id: o.animal_breed_id === '' ? null : Number(o.animal_breed_id),
        notes: o.notes || null
      }))
    }

    try {
      const result = await resource.create(payload)

      if (!result.ok) {
        setValidationErrors(result.errors)
        submitError.value = result.message || 'Validation failed'
        return { ok: false, synced: false }
      }

      // The response is the refreshed breeding; offline it's just our payload,
      // so fall back to the optimistic shape and cache it so a reload while
      // still offline doesn't show the pregnancy as pending again.
      // The server answered with an error. The birth is queued, but no
      // offspring exist yet — saying nothing here is what made a failed
      // registration look like it had worked.
      if (result.warning) {
        submitError.value = `${result.warning} Nothing has reached the server yet — the app will keep retrying.`
        return { ok: false, synced: false }
      }

      const server = result.record as unknown as BreedingRecord
      const merged = result.synced && server?.status ? server : optimisticBreeding()

      if (!result.synced && breedingUuid) {
        await db.putRecord('breeding', breedingUuid, animalUuid, merged, false)
      }

      return { ok: true, synced: result.synced, breeding: merged }
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to record the birth'
      console.error('Failed to register birth:', err)
      return { ok: false, synced: false }
    } finally {
      submitting.value = false
    }
  }

  return {
    birthForm,
    submitting,
    submitError,
    formErrors,
    offspringErrors,
    errorList,
    liveCount,
    stillbornCount,
    summary,
    addOffspring,
    removeOffspring,
    reset,
    registerBirth
  }
}
