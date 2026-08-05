// Animal treatments — offline-first via useOfflineEntity.
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
  synced?: boolean
  sync_error?: string | null
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
  const isGroup = trackingType === 'group'
  const resource = useOfflineEntity<AnimalTreatmentRecord>('treatment', {
    model: isGroup ? 'animal_group' : 'animal',
    parentUuid: animalUuid
  })
  const { getReference } = useReferenceData()
  const { isOnline } = useOffline()

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    details: '',
    treatment_type_id: '',
    date: today(),
    notes: '',
    retreat_date: '',
    record_expense: false,
    expense_amount: '',
    // Optionally draw this treatment from bulk stock instead of a manual cost.
    use_from_stock: false,
    input_uuid: '',
    input_quantity_used: ''
  })

  const treatmentTypes = ref<AnimalTreatmentTypeOption[]>([])
  // In-stock farm inputs the treatment can be drawn from.
  const inputs = ref<Array<{ uuid: string, name: string, unit: string, quantity_remaining: number, unit_cost: number }>>([])
  const loading = resource.loading
  const loadError = resource.loadError
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

  const treatments = computed(() =>
    resource.items.value.map(r => ({ ...r, treatment_type_name: mapTypeName(r) }))
  )

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
      const { data } = await getReference<AnimalTreatmentTypeOption>('treatment_types_livestock')
      treatmentTypes.value = data.map(t => ({ ...t, status: normalizeTypeStatus(t.status) }))
    } catch (err) {
      console.error('Failed to fetch animal treatment types:', err)
      treatmentTypes.value = []
    }
  }

  const fetchTreatments = () => resource.fetch()

  const { $apiFetch } = useNuxtApp()
  const fetchInputs = async () => {
    if (!isOnline.value) return
    try {
      const response = await $apiFetch<any>('/api/v1/farms/farm/inputs/list?in_stock=1')
      const data = (Array.isArray(response) ? response : response?.data) ?? []
      inputs.value = data
        .filter((i: any) => Number(i.quantity_remaining) > 0)
        .map((i: any) => ({
          uuid: i.uuid,
          name: i.name,
          unit: i.unit,
          quantity_remaining: Number(i.quantity_remaining),
          unit_cost: Number(i.unit_cost)
        }))
    } catch (err) {
      console.error('Failed to load farm inputs:', err)
    }
  }

  const saveTreatment = async () => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    errorList.value = []

    const usingStock = treatmentForm.value.use_from_stock && !!treatmentForm.value.input_uuid
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
      // Drawing from stock carries the cost via the input, so the manual
      // expense is turned off to avoid double-counting.
      record_expense: usingStock ? false : treatmentForm.value.record_expense,
      expense_amount: !usingStock && treatmentForm.value.record_expense && treatmentForm.value.expense_amount
        ? Number(treatmentForm.value.expense_amount)
        : null,
      input_uuid: usingStock ? treatmentForm.value.input_uuid : null,
      input_quantity_used: usingStock && treatmentForm.value.input_quantity_used
        ? Number(treatmentForm.value.input_quantity_used)
        : null
    }

    try {
      const result = await resource.create(payload, {
        ...payload,
        treatment_type_name: selectedTreatmentType.value?.name ?? null
      })
      if (!result.ok) {
        setValidationErrors(result.errors)
        submitError.value = result.message || 'Failed to save treatment'
        return
      }
      closeModal()
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save treatment'
      console.error('Failed to save treatment:', err)
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    fetchTreatmentTypes()
    fetchTreatments()
    fetchInputs()
  })

  return {
    treatments,
    treatmentTypes,
    inputs,
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
