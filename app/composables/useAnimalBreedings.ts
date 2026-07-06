// Breeding records for an animal — offline-first via useOfflineEntity.
// This composable owns only form/modal state and display helpers;
// persistence, queueing and sync live in the generic layer.

export interface BreedingRecord {
  uuid?: string
  id?: string
  farm_id?: number | string | null
  dam_id?: number | string | null
  dam?: {
    uuid?: string
    name?: string | null
    tag_number?: string | null
    animal_type?: { id?: number; name?: string } | null
    breed?: { id?: number; name?: string } | null
  } | null
  sire_id?: number | string | null
  sire?: {
    uuid?: string
    name?: string | null
    tag_number?: string | null
    animal_type?: { id?: number; name?: string } | null
    breed?: { id?: number; name?: string } | null
  } | null
  sire_type: 'natural' | 'ai' | 'embryo'
  service_date: string
  service_date_human?: string | null
  expected_birth_date?: string | null
  expected_birth_date_human?: string | null
  status: 'pending' | 'born' | 'aborted' | 'failed'
  ai_straw_code?: string | null
  ai_bull_name?: string | null
  ai_technician?: string | null
  notes?: string | null
  synced?: boolean
  sync_error?: string | null
  created_at?: string
  updated_at?: string
}

type BreedingFormErrorKey = 'sire_type' | 'sire_id' | 'service_date' | 'expected_birth_date' | 'status' | 'ai_straw_code' | 'ai_bull_name' | 'ai_technician' | 'notes'
type BreedingValidationErrors = Partial<Record<BreedingFormErrorKey, string>>

export const useAnimalBreedings = (animalUuid: string, trackingType: 'individual' | 'group') => {
  const resource = useOfflineEntity<BreedingRecord>('breeding', { animalUuid })
  const { getReference } = useReferenceData()

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    sire_type: 'natural' as 'natural' | 'ai' | 'embryo',
    sire_id: '' as string,
    service_date: today(),
    expected_birth_date: '',
    status: 'pending' as 'pending' | 'born' | 'aborted' | 'failed',
    ai_straw_code: '',
    ai_bull_name: '',
    ai_technician: '',
    notes: ''
  })

  const breedings = resource.items
  const loading = resource.loading
  const loadError = resource.loadError
  const sireOptions = ref<Array<{ uuid: string; name: string; tag_number: string | null; gender?: string }>>([])
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const showModal = ref(false)
  const formErrors = ref<BreedingValidationErrors>({})
  const errorList = ref<string[]>([])
  const breedingForm = ref(createDefaultForm())
  const sireSearch = ref('')
  const showSireResults = ref(false)

  const filteredSires = computed(() => {
    const query = sireSearch.value.trim().toLowerCase()
    if (!query) return sireOptions.value
    return sireOptions.value.filter(s =>
      (s.name?.toLowerCase() ?? '').includes(query) ||
      (s.tag_number?.toLowerCase() ?? '').includes(query)
    )
  })

  const resetForm = () => {
    breedingForm.value = createDefaultForm()
    submitError.value = null
    formErrors.value = {}
    errorList.value = []
    sireSearch.value = ''
    showSireResults.value = false
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
    showSireResults.value = false
  }

  const handleSireSearch = () => {
    breedingForm.value.sire_id = ''
    showSireResults.value = true
  }

  const selectSire = (sire: { uuid: string; name: string; tag_number: string | null; gender?: string }) => {
    breedingForm.value.sire_id = sire.uuid
    sireSearch.value = `${sire.name}${sire.tag_number ? ` (${sire.tag_number})` : ''}`
    showSireResults.value = false
  }

  const setValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
    const mapped: BreedingValidationErrors = {}
    const list: string[] = []
    if (!errors) { formErrors.value = {}; errorList.value = []; return }
    for (const [key, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value
      if (!message) continue
      list.push(message)
      mapped[key as BreedingFormErrorKey] = message
    }
    formErrors.value = mapped
    errorList.value = [...new Set(list)]
  }

  const sireTypeLabel = (type: string) => {
    switch (type) {
      case 'natural': return 'Natural'
      case 'ai': return 'AI'
      case 'embryo': return 'Embryo'
      default: return type
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'born': return 'Born'
      case 'aborted': return 'Aborted'
      case 'failed': return 'Failed'
      default: return status
    }
  }

  const fetchSires = async () => {
    try {
      const { data } = await getReference<{ uuid: string; name: string; tag_number: string | null; gender?: string }>('livestock_list')
      sireOptions.value = data.filter(a => a.gender === 'male')
    } catch (err) {
      console.error('Failed to fetch sires:', err)
      sireOptions.value = []
    }
  }

  const fetchBreedings = () => resource.fetch()

  const saveBreeding = async () => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    errorList.value = []

    const form = breedingForm.value
    const isAI = form.sire_type === 'ai'

    const payload = {
      dam_id: animalUuid,
      sire_id: (form.sire_type === 'natural' || form.sire_type === 'embryo') && form.sire_id
        ? form.sire_id
        : null,
      sire_type: form.sire_type,
      service_date: form.service_date || today(),
      expected_birth_date: form.expected_birth_date || null,
      status: form.status,
      ai_straw_code: isAI ? (form.ai_straw_code || null) : null,
      ai_bull_name: isAI ? (form.ai_bull_name || null) : null,
      ai_technician: isAI ? (form.ai_technician || null) : null,
      notes: form.notes || null
    }

    try {
      const result = await resource.create(payload)
      if (!result.ok) {
        setValidationErrors(result.errors)
        submitError.value = result.message || 'Validation failed'
        return
      }
      closeModal()
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save breeding record'
      console.error('Failed to save breeding:', err)
    } finally {
      submitting.value = false
    }
  }

  const updateBreedingStatus = async (breedingUuid: string, newStatus: 'pending' | 'born' | 'aborted' | 'failed') => {
    try {
      await resource.update(breedingUuid, { status: newStatus })
    } catch (err) {
      console.error('Failed to update breeding status:', err)
    }
  }

  onMounted(() => {
    fetchSires()
    fetchBreedings()
  })

  return {
    breedings,
    sireOptions,
    loading,
    loadError,
    submitting,
    submitError,
    showModal,
    formErrors,
    errorList,
    breedingForm,
    sireSearch,
    showSireResults,
    filteredSires,
    sireTypeLabel,
    statusLabel,
    resetForm,
    openModal,
    closeModal,
    handleSireSearch,
    selectSire,
    fetchBreedings,
    saveBreeding,
    updateBreedingStatus
  }
}
