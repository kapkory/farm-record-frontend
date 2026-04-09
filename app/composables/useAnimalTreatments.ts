export interface AnimalTreatmentRecord {
  uuid?: string
  date?: string | null
  date_human?: string | null
  treatment_type_id?: number | string | null
  treatment_type_name?: string | null
  treatment_type?: string | { id?: number | string | null; name?: string | null } | null
  details?: string | null
  notes?: string | null
  retreat_date?: string | null
  expense_amount?: number | string | null
}

export interface AnimalTreatmentTypeOption {
  id: number | string
  name: string
  description?: string | null
  status?: 'active' | 'inactive' | 1 | 0 | '1' | '0'
}

type TreatmentFormErrorKey = 'details' | 'treatment_type_id' | 'date' | 'notes' | 'retreat_date' | 'expense_amount'
type TreatmentValidationErrors = Partial<Record<TreatmentFormErrorKey, string>>

export const useAnimalTreatments = (animalUuid: string, trackingType: 'individual' | 'group') => {
  const { $apiFetch } = useNuxtApp()
  const { isOnline } = useOffline()

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    details: '',
    treatment_type_id: '',
    date: today(),
    notes: '',
    retreat_date: '',
    record_expense: false,
    expense_amount: ''
  })

  const treatments = ref<AnimalTreatmentRecord[]>([])
  const treatmentTypes = ref<AnimalTreatmentTypeOption[]>([])
  const loading = ref(true)
  const loadError = ref<string | null>(null)
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const showModal = ref(false)
  const formErrors = ref<TreatmentValidationErrors>({})
  const errorList = ref<string[]>([])
  const treatmentForm = ref(createDefaultForm())
  const treatmentTypeSearch = ref('')
  const showTreatmentTypeResults = ref(false)

  const normalizeTypeStatus = (status: AnimalTreatmentTypeOption['status']) =>
    status === 1 || status === '1' || status === 'active' ? 'active' : 'inactive'

  const activeTreatmentTypes = computed(() =>
    treatmentTypes.value.filter(t => normalizeTypeStatus(t.status) === 'active')
  )

  const searchedTreatmentTypes = computed(() => {
    const query = treatmentTypeSearch.value.trim().toLowerCase()
    if (!query) return activeTreatmentTypes.value
    return activeTreatmentTypes.value.filter(t =>
      t.name.toLowerCase().includes(query) || (t.description?.toLowerCase() ?? '').includes(query)
    )
  })

  const selectedTreatmentType = computed(() =>
    treatmentTypes.value.find(t => String(t.id) === treatmentForm.value.treatment_type_id) ?? null
  )

  const mapTypeName = (record: AnimalTreatmentRecord) => {
    if (record.treatment_type_name) return record.treatment_type_name
    if (typeof record.treatment_type === 'string' && record.treatment_type) return record.treatment_type
    if (record.treatment_type && typeof record.treatment_type === 'object') return record.treatment_type.name ?? '—'
    return '—'
  }

  const resetForm = () => {
    treatmentForm.value = createDefaultForm()
    submitError.value = null
    formErrors.value = {}
    errorList.value = []
  }

  const openModal = () => {
    resetForm()
    treatmentTypeSearch.value = ''
    showTreatmentTypeResults.value = false
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    submitError.value = null
    formErrors.value = {}
    errorList.value = []
    showTreatmentTypeResults.value = false
  }

  const handleTreatmentTypeSearch = () => {
    treatmentForm.value.treatment_type_id = ''
    showTreatmentTypeResults.value = true
  }

  const selectTreatmentType = (type: AnimalTreatmentTypeOption) => {
    treatmentForm.value.treatment_type_id = String(type.id)
    treatmentTypeSearch.value = type.name
    showTreatmentTypeResults.value = false
  }

  const setValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
    const mapped: TreatmentValidationErrors = {}
    const list: string[] = []
    if (!errors) { formErrors.value = {}; errorList.value = []; return }
    for (const [key, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value
      if (!message) continue
      list.push(message)
      mapped[key as TreatmentFormErrorKey] = message
    }
    formErrors.value = mapped
    errorList.value = [...new Set(list)]
  }

  const fetchTreatmentTypes = async () => {
    try {
      if (!isOnline.value) { treatmentTypes.value = []; return }
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data?: AnimalTreatmentTypeOption[] }>(
        '/api/v1/settings/crops/treatment-types/list/livestock'
      )
      treatmentTypes.value = (response.data ?? []).map(t => ({
        ...t,
        status: normalizeTypeStatus(t.status)
      }))
    } catch (err) {
      console.error('Failed to fetch animal treatment types:', err)
      treatmentTypes.value = []
    }
  }

  const fetchTreatments = async () => {
    loading.value = true
    loadError.value = null
    try {
      if (!isOnline.value) { treatments.value = []; return }
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data?: AnimalTreatmentRecord[] }>(
        `/api/v1/livestock/${animalUuid}/treatments`
      )
      treatments.value = (response.data ?? []).map(r => ({
        ...r,
        treatment_type_name: mapTypeName(r)
      }))
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'An error occurred while loading treatments'
      console.error('Failed to fetch treatments:', err)
      treatments.value = []
    } finally {
      loading.value = false
    }
  }

  const saveTreatment = async () => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    errorList.value = []

    const isGroup = trackingType === 'group'

    const payload = {
      model: isGroup ? 'animal_group' : 'animal',
      animal_uuid: isGroup ? null : animalUuid,
      animal_group_uuid: isGroup ? animalUuid : null,
      treatment_type_id: treatmentForm.value.treatment_type_id
        ? Number(treatmentForm.value.treatment_type_id)
        : null,
      details: treatmentForm.value.details || null,
      date: treatmentForm.value.date || today(),
      retreat_date: treatmentForm.value.retreat_date || null,
      notes: treatmentForm.value.notes || null,
      record_expense: treatmentForm.value.record_expense,
      expense_amount: treatmentForm.value.record_expense && treatmentForm.value.expense_amount
        ? Number(treatmentForm.value.expense_amount)
        : null
    }

    try {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: AnimalTreatmentRecord }>(
        `/api/v1/farms/farm/crops/treatments`,
        { method: 'POST', body: payload }
      )
      treatments.value.unshift(response.data)
      closeModal()
    } catch (err) {
      const responseData =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
          : undefined
      setValidationErrors(responseData?.errors)
      submitError.value =
        responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save treatment')
      console.error('Failed to save treatment:', err)
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    fetchTreatmentTypes()
    fetchTreatments()
  })

  return {
    treatments,
    treatmentTypes,
    loading,
    loadError,
    submitting,
    submitError,
    showModal,
    formErrors,
    errorList,
    treatmentForm,
    treatmentTypeSearch,
    showTreatmentTypeResults,
    searchedTreatmentTypes,
    selectedTreatmentType,
    mapTypeName,
    openModal,
    closeModal,
    handleTreatmentTypeSearch,
    selectTreatmentType,
    fetchTreatments,
    saveTreatment
  }
}
