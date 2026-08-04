// Live weight readings — offline-first via useOfflineEntity.
//
// A reading's `weight_kg` is always canonical: kilograms, per head. For a
// group the farmer weighs a sample and enters the total, and the backend
// divides it down, so an ox and a broiler flock trend on the same axis.
//
// Gain and average daily gain are derived here rather than server-side, for
// the same reason the breeding countdown is: a reading queued offline has to
// show the right numbers before it has ever reached the API.

export interface AnimalWeightRecord {
  uuid?: string
  measured_on?: string | null
  measured_on_human?: string | null
  weight_kg?: number | null
  entered_value?: number | null
  entered_unit?: 'kg' | 'g' | 'lb' | null
  sample_size?: number | null
  sample_total_kg?: number | null
  is_sample?: boolean
  notes?: string | null
  synced?: boolean
  sync_error?: string | null
  created_at?: string
}

export interface WeightRow extends AnimalWeightRecord {
  /** Change in kg per head against the previous (earlier) reading. */
  delta_kg: number | null
  /** Average daily gain in kg since the previous reading. */
  gain_per_day: number | null
  days_since_previous: number | null
}

type WeightUnit = 'kg' | 'g' | 'lb'

export const WEIGHT_UNITS: Array<{ value: WeightUnit; label: string }> = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'grams' },
  { value: 'lb', label: 'lb' }
]

const UNIT_TO_KG: Record<WeightUnit, number> = { kg: 1, g: 0.001, lb: 0.45359237 }

export const toKilograms = (value: number, unit: WeightUnit) =>
  Math.round(value * (UNIT_TO_KG[unit] ?? 1) * 1000) / 1000

const daysBetween = (from: string, to: string) => {
  const a = new Date(`${from}T00:00:00`).getTime()
  const b = new Date(`${to}T00:00:00`).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.round((b - a) / 86_400_000)
}

type WeightFormErrorKey = 'measured_on' | 'entered_value' | 'entered_unit' | 'sample_size' | 'notes' | 'weighable_uuid'
type WeightValidationErrors = Partial<Record<WeightFormErrorKey, string>>

export const useAnimalWeights = (
  weighableUuid: string,
  trackingType: 'individual' | 'group' = 'individual',
  options: { intervalDays?: number | null; dateOfBirth?: string | null } = {}
) => {
  const weighableType = trackingType === 'group' ? 'animal_group' : 'animal'
  const resource = useOfflineEntity<AnimalWeightRecord>('animalWeight', { weighableUuid, weighableType })

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    measured_on: today(),
    entered_value: '' as string | number,
    entered_unit: 'kg' as WeightUnit,
    sample_size: trackingType === 'group' ? 10 : 1,
    notes: ''
  })

  const weights = resource.items
  const loading = resource.loading
  const loadError = resource.loadError
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const formErrors = ref<WeightValidationErrors>({})
  const errorList = ref<string[]>([])
  const showModal = ref(false)
  const form = ref(createDefaultForm())

  const isGroup = trackingType === 'group'

  // ── Derived series ────────────────────────────────────────────────────────

  /** Oldest → newest. The input for the trend chart. */
  const series = computed(() =>
    [...weights.value]
      .filter(w => w.measured_on && typeof w.weight_kg === 'number')
      .sort((a, b) => String(a.measured_on).localeCompare(String(b.measured_on)))
  )

  /** Newest first, each row carrying its gain against the reading before it. */
  const rows = computed<WeightRow[]>(() => {
    const ascending = series.value
    const decorated = ascending.map((record, index) => {
      const previous = index > 0 ? ascending[index - 1] : null
      const days = previous?.measured_on && record.measured_on
        ? daysBetween(previous.measured_on, record.measured_on)
        : null
      const delta = previous && typeof previous.weight_kg === 'number' && typeof record.weight_kg === 'number'
        ? Math.round((record.weight_kg - previous.weight_kg) * 1000) / 1000
        : null

      return {
        ...record,
        delta_kg: delta,
        days_since_previous: days,
        gain_per_day: delta !== null && days && days > 0 ? Math.round((delta / days) * 1000) / 1000 : null
      } as WeightRow
    })

    return decorated.reverse()
  })

  const latest = computed(() => series.value[series.value.length - 1] ?? null)

  const stats = computed(() => {
    const list = series.value
    const current = list[list.length - 1] ?? null
    const previous = list.length > 1 ? list[list.length - 2] : null

    const delta = current && previous
      && typeof current.weight_kg === 'number' && typeof previous.weight_kg === 'number'
      ? Math.round((current.weight_kg - previous.weight_kg) * 1000) / 1000
      : null

    const days = current?.measured_on && previous?.measured_on
      ? daysBetween(previous.measured_on, current.measured_on)
      : null

    // Gain since birth is only meaningful when we know when the animal was
    // born; purchased stock and groups usually don't have a date of birth.
    const ageDays = options.dateOfBirth && current?.measured_on
      ? daysBetween(options.dateOfBirth, current.measured_on)
      : null

    return {
      current: current?.weight_kg ?? null,
      measuredOn: current?.measured_on ?? null,
      delta,
      daysSincePrevious: days,
      gainPerDay: delta !== null && days && days > 0 ? Math.round((delta / days) * 1000) / 1000 : null,
      gainPerDaySinceBirth: ageDays && ageDays > 0 && typeof current?.weight_kg === 'number'
        ? Math.round((current.weight_kg / ageDays) * 1000) / 1000
        : null,
      readings: list.length
    }
  })

  /** When the next weighing falls due, from the last reading + the interval. */
  const nextDue = computed(() => {
    const interval = options.intervalDays ?? null
    const last = latest.value?.measured_on
    if (!interval || !last) return null

    const due = new Date(`${last}T00:00:00`)
    if (Number.isNaN(due.getTime())) return null
    due.setDate(due.getDate() + interval)

    const dueDate = due.toISOString().split('T')[0] ?? ''
    return { date: dueDate, inDays: daysBetween(today(), dueDate) }
  })

  // ── Form ──────────────────────────────────────────────────────────────────

  /** What a group sample works out to per head, previewed before saving. */
  const samplePreviewKg = computed(() => {
    const value = Number(form.value.entered_value)
    const size = Number(form.value.sample_size) || 1
    if (!value || value <= 0 || size < 1) return null
    return Math.round((toKilograms(value, form.value.entered_unit) / size) * 1000) / 1000
  })

  const resetForm = () => {
    form.value = createDefaultForm()
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
    const mapped: WeightValidationErrors = {}
    const list: string[] = []
    if (!errors) { formErrors.value = {}; errorList.value = []; return }
    for (const [key, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value
      if (!message) continue
      list.push(message)
      mapped[key as WeightFormErrorKey] = message
    }
    formErrors.value = mapped
    errorList.value = [...new Set(list)]
  }

  const fetchWeights = () => resource.fetch()

  const saveWeight = async () => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    errorList.value = []

    const sampleSize = isGroup ? Math.max(1, Number(form.value.sample_size) || 1) : 1
    const enteredValue = Number(form.value.entered_value)

    const payload = {
      weighable_type: weighableType,
      weighable_uuid: weighableUuid,
      measured_on: form.value.measured_on || today(),
      entered_value: enteredValue,
      entered_unit: form.value.entered_unit,
      sample_size: sampleSize,
      notes: form.value.notes || null
    }

    // What the server will store, so an offline row shows real numbers in the
    // table and the trend instead of blanks until it syncs.
    const enteredKg = toKilograms(enteredValue, form.value.entered_unit)
    const display = {
      ...payload,
      weight_kg: sampleSize > 1 ? Math.round((enteredKg / sampleSize) * 1000) / 1000 : enteredKg,
      sample_total_kg: sampleSize > 1 ? enteredKg : null,
      is_sample: sampleSize > 1
    }

    try {
      const result = await resource.create(payload, display)
      if (!result.ok) {
        setValidationErrors(result.errors)
        submitError.value = result.message || 'Validation failed'
        return
      }
      if (result.warning) {
        submitError.value = `${result.warning} The reading is queued and will be retried.`
        return
      }
      closeModal()
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save the weight'
      console.error('Failed to save weight:', err)
    } finally {
      submitting.value = false
    }
  }

  const removeWeight = async (uuid: string) => {
    try {
      await resource.remove(uuid)
    } catch (err) {
      console.error('Failed to delete weight:', err)
    }
  }

  /** "2.4 kg" / "850 g" — echoes the unit the farmer actually typed. */
  const formatEntered = (record: AnimalWeightRecord) => {
    if (record.entered_value === null || record.entered_value === undefined) return '—'
    return `${record.entered_value} ${record.entered_unit ?? 'kg'}`
  }

  const formatKg = (value: number | null | undefined, digits = 2) =>
    value === null || value === undefined ? '—' : `${Number(value).toFixed(digits)} kg`

  onMounted(fetchWeights)

  return {
    weights,
    series,
    rows,
    stats,
    latest,
    nextDue,
    isGroup,
    loading,
    loadError,
    submitting,
    submitError,
    formErrors,
    errorList,
    showModal,
    form,
    samplePreviewKg,
    openModal,
    closeModal,
    resetForm,
    fetchWeights,
    saveWeight,
    removeWeight,
    formatEntered,
    formatKg
  }
}
