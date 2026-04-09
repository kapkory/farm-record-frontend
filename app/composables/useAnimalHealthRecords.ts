export interface AnimalHealthRecord {
  uuid: string
  date: string
  type: string
  description: string
  vet_name: string | null
  outcome: string
  next_due_date: string | null
  cost: number | null
}

type HealthFormErrorKey = 'date' | 'type' | 'description' | 'vet_name' | 'outcome' | 'next_due_date'
type HealthValidationErrors = Partial<Record<HealthFormErrorKey, string>>

export const useAnimalHealthRecords = (animalUuid: string) => {
  const { $apiFetch } = useNuxtApp()
  const { isOnline } = useOffline()

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    date: today(),
    type: '',
    description: '',
    vet_name: '',
    outcome: 'resolved',
    next_due_date: ''
  })

  const healthRecords = ref<AnimalHealthRecord[]>([])
  const loading = ref(true)
  const loadError = ref<string | null>(null)
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const showModal = ref(false)
  const formErrors = ref<HealthValidationErrors>({})
  const errorList = ref<string[]>([])
  const healthForm = ref(createDefaultForm())

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

  const fetchHealthRecords = async () => {
    loading.value = true
    loadError.value = null
    try {
      if (!isOnline.value) { healthRecords.value = []; return }
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data?: AnimalHealthRecord[] }>(
        `/api/v1/livestock/${animalUuid}/health-records`
      )
      healthRecords.value = response.data ?? []
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'An error occurred while loading health records'
      console.error('Failed to fetch health records:', err)
      healthRecords.value = []
    } finally {
      loading.value = false
    }
  }

  const saveHealthRecord = async () => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    errorList.value = []

    const payload = {
      date: healthForm.value.date || today(),
      type: healthForm.value.type,
      description: healthForm.value.description,
      vet_name: healthForm.value.vet_name || null,
      outcome: healthForm.value.outcome,
      next_due_date: healthForm.value.next_due_date || null
    }

    try {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: AnimalHealthRecord }>(
        `/api/v1/livestock/${animalUuid}/health-records`,
        { method: 'POST', body: payload }
      )
      healthRecords.value.unshift(response.data)
      closeModal()
    } catch (err) {
      const responseData =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
          : undefined
      setValidationErrors(responseData?.errors)
      submitError.value =
        responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save health record')
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
