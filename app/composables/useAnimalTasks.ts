type TaskPriority = 1 | 2 | 3 | 4
type TaskStatus = 1 | 2 | 3 | 4 | 5

export interface AnimalFarmUser {
  id: number | string
  name?: string | null
  email?: string | null
}

export interface AnimalTaskRecord {
  id?: number | string
  uuid?: string
  title?: string | null
  description?: string | null
  priority?: number | string | null
  task_status?: number | string | null
  due_date?: string | null
  is_overdue?: boolean
  assigned_to_user_id?: number | string | null
  assignee?: AnimalFarmUser | null
  parent_task_id?: number | string | null
  sub_tasks_count?: number
  sub_tasks?: AnimalTaskRecord[]
}

type TaskFormErrorKey =
  | 'title'
  | 'description'
  | 'priority'
  | 'task_status'
  | 'due_date'
  | 'assigned_to_user_id'
  | 'parent_task_id'
type TaskValidationErrors = Partial<Record<TaskFormErrorKey, string>>

export const useAnimalTasks = (animalUuid: string, trackingType: 'individual' | 'group' = 'individual') => {
  const { $apiFetch } = useNuxtApp()
  const { isOnline } = useOffline()

  const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' },
    { value: 4, label: 'Critical' }
  ]

  const statusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: 1, label: 'Pending' },
    { value: 2, label: 'In Progress' },
    { value: 3, label: 'On Hold' },
    { value: 4, label: 'Completed' },
    { value: 5, label: 'Cancelled' }
  ]

  const createDefaultForm = () => ({
    title: '',
    description: '',
    priority: '1',
    task_status: '1',
    due_date: '',
    assigned_to_user_id: '',
    parent_task_id: ''
  })

  const tasks = ref<AnimalTaskRecord[]>([])
  const farmUsers = ref<AnimalFarmUser[]>([])
  const loading = ref(true)
  const loadError = ref<string | null>(null)
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const showModal = ref(false)
  const formErrors = ref<TaskValidationErrors>({})
  const errorList = ref<string[]>([])
  const taskForm = ref(createDefaultForm())

  const parentTaskOptions = computed(() =>
    tasks.value.filter(t => String(t.id ?? '') !== taskForm.value.parent_task_id)
  )

  const toNumberOrNull = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  const priorityLabel = (value: number | string | null | undefined) =>
    priorityOptions.find(o => o.value === Number(value))?.label ?? 'Low'

  const statusLabel = (value: number | string | null | undefined) =>
    statusOptions.find(o => o.value === Number(value))?.label ?? 'Pending'

  const priorityBadgeClass = (value: number | string | null | undefined) => {
    const base = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold'
    const p = Number(value)
    if (p === 4) return `${base} bg-red-100 text-red-800`
    if (p === 3) return `${base} bg-amber-100 text-amber-800`
    if (p === 2) return `${base} bg-blue-100 text-blue-800`
    return `${base} bg-gray-100 text-gray-800`
  }

  const statusBadgeClass = (value: number | string | null | undefined) => {
    const base = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold'
    const s = Number(value)
    if (s === 4) return `${base} bg-green-100 text-green-800`
    if (s === 2) return `${base} bg-blue-100 text-blue-800`
    if (s === 3) return `${base} bg-amber-100 text-amber-800`
    if (s === 5) return `${base} bg-red-100 text-red-800`
    return `${base} bg-gray-100 text-gray-800`
  }

  const resetForm = () => {
    taskForm.value = createDefaultForm()
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
    const mapped: TaskValidationErrors = {}
    const list: string[] = []
    if (!errors) { formErrors.value = {}; errorList.value = []; return }
    for (const [key, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value
      if (!message) continue
      list.push(message)
      mapped[key as TaskFormErrorKey] = message
    }
    formErrors.value = mapped
    errorList.value = [...new Set(list)]
  }

  const fetchFarmUsers = async () => {
    try {
      if (!isOnline.value) { farmUsers.value = []; return }
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data?: AnimalFarmUser[] }>('/api/v1/farms/farm/users/list')
      farmUsers.value = response.data ?? []
    } catch (err) {
      console.error('Failed to fetch farm users:', err)
      farmUsers.value = []
    }
  }

  const fetchTasks = async () => {
    loading.value = true
    loadError.value = null
    try {
      if (!isOnline.value) { tasks.value = []; return }
      await $apiFetch('/sanctum/csrf-cookie')
      const taskable_type = trackingType === 'group' ? 'animal_group' : 'animal'
      const response = await $apiFetch<{ data?: AnimalTaskRecord[] }>(
        `/api/v1/tasks/list/${animalUuid}`,
        { params: { taskable_type } }
      )
      tasks.value = response.data ?? []
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'An error occurred while loading tasks'
      console.error('Failed to fetch tasks:', err)
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  const saveTask = async () => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    errorList.value = []

    const payload = {
      title: taskForm.value.title || null,
      description: taskForm.value.description || null,
      priority: Number(taskForm.value.priority),
      task_status: Number(taskForm.value.task_status),
      due_date: taskForm.value.due_date || null,
      assigned_to_user_id: toNumberOrNull(taskForm.value.assigned_to_user_id),
      parent_task_id: toNumberOrNull(taskForm.value.parent_task_id),
      taskable_type: trackingType === 'group' ? 'animal_group' : 'animal',
      taskable_uuid: animalUuid
    }

    try {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch('/api/v1/tasks', { method: 'POST', body: payload })
      await fetchTasks()
      resetForm()
      closeModal()
    } catch (err) {
      const responseData =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
          : undefined
      setValidationErrors(responseData?.errors)
      submitError.value =
        responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save task')
      console.error('Failed to save task:', err)
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    fetchFarmUsers()
    fetchTasks()
  })

  return {
    tasks,
    farmUsers,
    loading,
    loadError,
    submitting,
    submitError,
    showModal,
    formErrors,
    errorList,
    taskForm,
    priorityOptions,
    statusOptions,
    parentTaskOptions,
    priorityLabel,
    statusLabel,
    priorityBadgeClass,
    statusBadgeClass,
    openModal,
    closeModal,
    fetchTasks,
    saveTask
  }
}
