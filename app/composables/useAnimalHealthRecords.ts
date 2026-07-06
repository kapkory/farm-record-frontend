// Animal health records — offline-first via useOfflineEntity.
//
// There is no dedicated health-records endpoint; records are stored as
// AnimalEvents (event_type 'other') with the health fields in `metadata`
// under kind: 'health_record'.
export interface AnimalHealthRecord {
  uuid: string
  date: string
  type: string
  description: string
  vet_name: string | null
  outcome: string
  next_due_date: string | null
  cost: number | null
  synced?: boolean
  sync_error?: string | null
}

interface AnimalEventRecord {
  uuid?: string
  event_type?: string
  date?: string | null
  description?: string | null
  metadata?: Record<string, any> | null
  synced?: boolean
  sync_error?: string | null
}

type HealthFormErrorKey = 'date' | 'type' | 'description' | 'vet_name' | 'outcome' | 'next_due_date'
type HealthValidationErrors = Partial<Record<HealthFormErrorKey, string>>

export const useAnimalHealthRecords = (animalUuid: string) => {
  const resource = useOfflineEntity<AnimalEventRecord>('animalEvent', { eventableUuid: animalUuid })

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    date: today(),
    type: '',
    description: '',
    vet_name: '',
    outcome: 'resolved',
    next_due_date: ''
  })

  const loading = resource.loading
  const loadError = resource.loadError
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const showModal = ref(false)
  const formErrors = ref<HealthValidationErrors>({})
  const errorList = ref<string[]>([])
  const healthForm = ref(createDefaultForm())

  const healthRecords = computed<AnimalHealthRecord[]>(() =>
    resource.items.value
      .filter(event => event.metadata?.kind === 'health_record')
      .map(event => ({
        uuid: event.uuid ?? '',
        date: event.date ?? '',
        type: event.metadata?.type ?? event.event_type ?? '',
        description: event.description ?? '',
        vet_name: event.metadata?.vet_name ?? null,
        outcome: event.metadata?.outcome ?? '',
        next_due_date: event.metadata?.next_due_date ?? null,
        cost: event.metadata?.cost ?? null,
        synced: event.synced,
        sync_error: event.sync_error
      }))
  )

  const resetForm = () => {
    healthForm.value = createDefaultForm()
    submitError.value = null
    formErrors.value = {}
    errorList.value = []
  }

  const openModal = () => {
    resetForm()
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    submitError.value = null
    formErrors.value = {}
    errorList.value = []
  }

  const setValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
    const mapped: HealthValidationErrors = {}
    const list: string[] = []
    if (!errors) { formErrors.value = {}; errorList.value = []; return }
    for (const [key, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value
      if (!message) continue
      list.push(message)
      mapped[key as HealthFormErrorKey] = message
    }
    formErrors.value = mapped
    errorList.value = [...new Set(list)]
  }

  const fetchHealthRecords = () => resource.fetch()

  const saveHealthRecord = async () => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    errorList.value = []

    const form = healthForm.value
    const payload = {
      eventable_type: 'animal',
      eventable_uuid: animalUuid,
      event_type: 'other',
      date: form.date || today(),
      description: form.description,
      metadata: {
        kind: 'health_record',
        type: form.type,
        vet_name: form.vet_name || null,
        outcome: form.outcome,
        next_due_date: form.next_due_date || null
      }
    }

    try {
      const result = await resource.create(payload)
      if (!result.ok) {
        setValidationErrors(result.errors)
        submitError.value = result.message || 'Failed to save health record'
        return
      }
      closeModal()
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save health record'
      console.error('Failed to save health record:', err)
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    fetchHealthRecords()
  })

  return {
    healthRecords,
    loading,
    loadError,
    submitting,
    submitError,
    showModal,
    formErrors,
    errorList,
    healthForm,
    openModal,
    closeModal,
    fetchHealthRecords,
    saveHealthRecord
  }
}
