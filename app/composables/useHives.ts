// Hives — offline-first via useOfflineEntity. Owns form/label state only;
// persistence lives in the generic layer. Hive codes are server-assigned
// (per-apiary counter), so a hive created offline has no code until its
// queued create syncs — surface that as "code pending", never invent one.

export interface HiveRecord {
  uuid?: string
  code?: string | null
  name?: string | null
  hive_type?: string | null
  occupancy?: 'occupied' | 'empty' | 'absconded' | 'dead'
  installed_date?: string | null
  last_inspected_at?: string | null
  last_harvested_at?: string | null
  next_harvest_due?: string | null
  harvest_interval_days?: number | null
  effective_harvest_interval_days?: number
  harvest_status?: 'ready' | 'waiting' | 'unknown'
  days_remaining?: number | null
  notes?: string | null
  apiary_uuid?: string | null
  apiary_name?: string | null
  synced?: boolean
  sync_error?: string | null
  created_at?: string
}

export const HIVE_TYPES = [
  { value: 'langstroth', label: 'Langstroth' },
  { value: 'kenya_top_bar', label: 'Kenya Top Bar' },
  { value: 'log', label: 'Log hive' },
  { value: 'box', label: 'Box hive' }
] as const

export const HIVE_OCCUPANCIES = [
  { value: 'occupied', label: 'Occupied' },
  { value: 'empty', label: 'Empty' },
  { value: 'absconded', label: 'Absconded' },
  { value: 'dead', label: 'Colony died' }
] as const

export const useHives = () => {
  const resource = useOfflineEntity<HiveRecord>('hive')

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    name: '',
    hive_type: 'langstroth',
    installed_date: today(),
    harvest_interval_days: null as number | null,
    notes: ''
  })

  const hives = resource.items
  const loading = resource.loading
  const loadError = resource.loadError
  const fromCache = resource.fromCache
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const errorList = ref<string[]>([])
  const showModal = ref(false)
  const hiveForm = ref(createDefaultForm())

  const resetForm = () => {
    hiveForm.value = createDefaultForm()
    submitError.value = null
    errorList.value = []
  }

  const openModal = () => {
    resetForm()
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
  }

  const fetchHives = () => resource.fetch()

  /** Hives for one apiary, in stable code order (pending-code hives last). */
  const hivesForApiary = (apiaryUuid: string) =>
    hives.value
      .filter(h => h.apiary_uuid === apiaryUuid)
      .sort((a, b) => (a.code ?? '￿').localeCompare(b.code ?? '￿'))

  const saveHive = async (apiaryUuid: string, apiaryName?: string) => {
    submitting.value = true
    submitError.value = null
    errorList.value = []

    const form = hiveForm.value
    const payload = {
      apiary_uuid: apiaryUuid,
      name: form.name || null,
      hive_type: form.hive_type || null,
      installed_date: form.installed_date || null,
      harvest_interval_days: form.harvest_interval_days || null,
      notes: form.notes || null
    }
    // Until the server assigns a code this record renders as "code pending".
    const display = {
      ...payload,
      code: null,
      occupancy: 'occupied' as const,
      harvest_status: 'unknown' as const,
      days_remaining: null,
      apiary_uuid: apiaryUuid,
      apiary_name: apiaryName ?? null
    }

    try {
      const result = await resource.create(payload, display)
      if (!result.ok) {
        errorList.value = [...new Set(Object.values(result.errors).flat())]
        submitError.value = result.message || 'Validation failed'
        return false
      }
      closeModal()
      return true
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save hive'
      return false
    } finally {
      submitting.value = false
    }
  }

  const setOccupancy = (uuid: string, occupancy: HiveRecord['occupancy']) =>
    resource.update(uuid, { occupancy })

  const removeHive = (uuid: string) => resource.remove(uuid)

  const hiveTypeLabel = (type?: string | null) =>
    HIVE_TYPES.find(t => t.value === type)?.label ?? (type || '—')

  const occupancyLabel = (occupancy?: string | null) =>
    HIVE_OCCUPANCIES.find(o => o.value === occupancy)?.label ?? (occupancy || '—')

  /** Plain-language readiness for the hive card chip. */
  const readiness = (hive: HiveRecord): { label: string, classes: string } => {
    if (hive.occupancy && hive.occupancy !== 'occupied') {
      return { label: occupancyLabel(hive.occupancy), classes: 'bg-gray-100 text-gray-500' }
    }
    switch (hive.harvest_status) {
      case 'ready':
        return { label: 'Ready to harvest', classes: 'bg-green-100 text-green-700' }
      case 'waiting':
        return {
          label: hive.days_remaining === 1 ? 'Ready tomorrow' : `Ready in ${hive.days_remaining} days`,
          classes: 'bg-amber-100 text-amber-700'
        }
      default:
        return { label: 'No harvest yet', classes: 'bg-gray-100 text-gray-500' }
    }
  }

  return {
    hives,
    loading,
    loadError,
    fromCache,
    submitting,
    submitError,
    errorList,
    showModal,
    hiveForm,
    fetchHives,
    hivesForApiary,
    saveHive,
    setOccupancy,
    removeHive,
    resetForm,
    openModal,
    closeModal,
    hiveTypeLabel,
    occupancyLabel,
    readiness
  }
}
