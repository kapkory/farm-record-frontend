<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4">
        <Button type="button" @click="openTaskModal" :disabled="!taskableUuidValue" class="inline-flex items-center gap-2">
          <Plus class="h-4 w-4" />
          New Task
        </Button>
        <p class="mt-1 text-sm text-gray-500">Track work to be done for this planting, who is responsible, and the current progress.</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading tasks...</span>
      </div>

      <div v-else-if="loadError" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load tasks</p>
        <p class="mt-1 text-sm">{{ loadError }}</p>
        <button @click="fetchTasks" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Task</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Due Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Assigned To</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Parent Task</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <template v-for="task in tasks" :key="task.id ?? task.uuid">
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <p class="text-sm font-medium text-gray-900">
                    {{ task.title || 'Untitled task' }}
                    <span v-if="task.sub_tasks_count" class="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {{ task.sub_tasks_count }} sub-task{{ task.sub_tasks_count === 1 ? '' : 's' }}
                    </span>
                  </p>
                  <p class="mt-1 max-w-md text-sm text-gray-500">{{ task.description || '—' }}</p>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span :class="priorityBadgeClass(task.priority)">{{ priorityLabel(task.priority) }}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span :class="statusBadgeClass(task.task_status)">{{ statusLabel(task.task_status) }}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ task.due_date || '—' }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ task.assignee?.name || task.assignee?.email || '—' }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">—</td>
              </tr>
              <tr v-for="sub in task.sub_tasks" :key="sub.id ?? sub.uuid" class="bg-gray-50 hover:bg-gray-100">
                <td class="py-3 pl-12 pr-6">
                  <div class="flex items-start gap-2">
                    <span class="mt-0.5 text-gray-300">↳</span>
                    <div>
                      <p class="text-sm font-medium text-gray-700">{{ sub.title || 'Untitled task' }}</p>
                      <p class="mt-0.5 max-w-md text-xs text-gray-500">{{ sub.description || '—' }}</p>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-3">
                  <span :class="priorityBadgeClass(sub.priority)">{{ priorityLabel(sub.priority) }}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-3">
                  <span :class="statusBadgeClass(sub.task_status)">{{ statusLabel(sub.task_status) }}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-3 text-sm text-gray-500">{{ sub.due_date || '—' }}</td>
                <td class="whitespace-nowrap px-6 py-3 text-sm text-gray-500">{{ sub.assignee?.name || sub.assignee?.email || '—' }}</td>
                <td class="whitespace-nowrap px-6 py-3 text-sm text-gray-500">{{ task.title || 'Untitled task' }}</td>
              </tr>
            </template>
            <tr v-if="!tasks.length">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No tasks found yet. Add the first task above.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAddTaskModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeTaskModal"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">New Task</h3>
                <p class="mt-1 text-sm text-gray-500">Capture what needs to be done, when it is due, and who should handle it.</p>
              </div>
              <button type="button" @click="closeTaskModal" class="text-gray-400 transition-colors hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="saveTask" class="space-y-5 p-6">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div class="xl:col-span-2">
                  <Label for="task_title" class="mb-1 block text-sm font-medium text-gray-700">Task Title</Label>
                  <Input id="task_title" v-model="taskForm.title" type="text" class="w-full" placeholder="Example: Apply top-dressing fertiliser" />
                  <p v-if="formErrors.title" class="mt-1 text-xs text-red-600">{{ formErrors.title }}</p>
                </div>

                <div>
                  <Label for="task_due_date" class="mb-1 block text-sm font-medium text-gray-700">Due Date</Label>
                  <Input id="task_due_date" v-model="taskForm.due_date" type="date" class="w-full" />
                  <p v-if="formErrors.due_date" class="mt-1 text-xs text-red-600">{{ formErrors.due_date }}</p>
                </div>

                <div>
                  <Label for="task_priority" class="mb-1 block text-sm font-medium text-gray-700">Priority</Label>
                  <select id="task_priority" v-model="taskForm.priority" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option v-for="option in priorityOptions" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
                  </select>
                  <p v-if="formErrors.priority" class="mt-1 text-xs text-red-600">{{ formErrors.priority }}</p>
                </div>

                <div>
                  <Label for="task_status" class="mb-1 block text-sm font-medium text-gray-700">Task Status</Label>
                  <select id="task_status" v-model="taskForm.task_status" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option v-for="option in statusOptions" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
                  </select>
                  <p v-if="formErrors.task_status" class="mt-1 text-xs text-red-600">{{ formErrors.task_status }}</p>
                </div>

                <div>
                  <Label for="task_assigned_to_user_id" class="mb-1 block text-sm font-medium text-gray-700">Assigned To</Label>
                  <select id="task_assigned_to_user_id" v-model="taskForm.assigned_to_user_id" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Unassigned</option>
                    <option v-for="user in farmUsers" :key="user.id" :value="String(user.id)">{{ user.name || user.email || `User ${user.id}` }}</option>
                  </select>
                  <p v-if="formErrors.assigned_to_user_id" class="mt-1 text-xs text-red-600">{{ formErrors.assigned_to_user_id }}</p>
                </div>

                <div>
                  <Label for="task_parent_task_id" class="mb-1 block text-sm font-medium text-gray-700">Parent Task</Label>
                  <select id="task_parent_task_id" v-model="taskForm.parent_task_id" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">No parent task</option>
                    <option v-for="parent in parentTaskOptions" :key="parent.id ?? parent.uuid" :value="String(parent.id)">{{ parent.title || 'Untitled task' }}</option>
                  </select>
                  <p v-if="formErrors.parent_task_id" class="mt-1 text-xs text-red-600">{{ formErrors.parent_task_id }}</p>
                </div>
              </div>

              <div>
                <Label for="task_description" class="mb-1 block text-sm font-medium text-gray-700">Description</Label>
                <textarea id="task_description" v-model="taskForm.description" rows="4" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Explain the work clearly in simple words"></textarea>
                <p v-if="formErrors.description" class="mt-1 text-xs text-red-600">{{ formErrors.description }}</p>
              </div>

              <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p class="font-medium">Please fix the following before saving:</p>
                <p class="mt-1">{{ submitError }}</p>
                <ul v-if="errorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in errorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" @click="closeTaskModal" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting || !taskableUuidValue">
                  <span v-if="submitting">Saving...</span>
                  <span v-else>Save Task</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { Plus, X } from 'lucide-vue-next'

type TaskPriority = 1 | 2 | 3 | 4
type TaskStatus = 1 | 2 | 3 | 4 | 5

interface FarmUserRecord {
  id: number | string
  name?: string | null
  email?: string | null
}

interface TaskRecord {
  id?: number | string
  uuid?: string
  title?: string | null
  description?: string | null
  priority?: number | string | null
  priority_label?: string | null
  task_status?: number | string | null
  task_status_label?: string | null
  due_date?: string | null
  due_date_human?: string | null
  is_overdue?: boolean
  assigned_to_user_id?: number | string | null
  assignee?: FarmUserRecord | null
  creator?: FarmUserRecord | null
  parent_task_id?: number | string | null
  taskable_type?: string | null
  taskable_id?: number | string | null
  sub_tasks_count?: number
  sub_tasks?: TaskRecord[]
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

const props = withDefaults(defineProps<{
  plantingUuid?: string
}>(), {
  plantingUuid: ''
})

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const route = useRoute()

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

const taskableUuidValue = computed(() => props.plantingUuid || String(route.params.uuid || ''))

const createDefaultForm = () => ({
  title: '',
  description: '',
  priority: '1',
  task_status: '1',
  due_date: '',
  assigned_to_user_id: '',
  parent_task_id: ''
})

const tasks = ref<TaskRecord[]>([])
const farmUsers = ref<FarmUserRecord[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const submitting = ref(false)
const submitError = ref<string | null>(null)
const showAddTaskModal = ref(false)
const formErrors = ref<TaskValidationErrors>({})
const errorList = ref<string[]>([])
const taskForm = ref(createDefaultForm())

const parentTaskOptions = computed(() =>
  tasks.value.filter((task) => String(task.id ?? '') !== taskForm.value.parent_task_id)
)

const toNumberOrNull = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const resetForm = () => {
  taskForm.value = createDefaultForm()
  submitError.value = null
  formErrors.value = {}
  errorList.value = []
}

const openTaskModal = () => {
  resetForm()
  showAddTaskModal.value = true
}

const closeTaskModal = () => {
  showAddTaskModal.value = false
  submitError.value = null
  formErrors.value = {}
  errorList.value = []
}

const priorityLabel = (value: number | string | null | undefined) => {
  const option = priorityOptions.find((item) => item.value === Number(value))
  return option?.label ?? 'Low'
}

const statusLabel = (value: number | string | null | undefined) => {
  const option = statusOptions.find((item) => item.value === Number(value))
  return option?.label ?? 'Pending'
}

const priorityBadgeClass = (value: number | string | null | undefined) => {
  const base = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold'
  const priority = Number(value)

  if (priority === 4) return `${base} bg-red-100 text-red-800`
  if (priority === 3) return `${base} bg-amber-100 text-amber-800`
  if (priority === 2) return `${base} bg-blue-100 text-blue-800`
  return `${base} bg-gray-100 text-gray-800`
}

const statusBadgeClass = (value: number | string | null | undefined) => {
  const base = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold'
  const status = Number(value)

  if (status === 4) return `${base} bg-green-100 text-green-800`
  if (status === 2) return `${base} bg-blue-100 text-blue-800`
  if (status === 3) return `${base} bg-amber-100 text-amber-800`
  if (status === 5) return `${base} bg-red-100 text-red-800`
  return `${base} bg-gray-100 text-gray-800`
}

const setValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
  const mapped: TaskValidationErrors = {}
  const list: string[] = []

  if (!errors) {
    formErrors.value = {}
    errorList.value = []
    return
  }

  for (const [key, value] of Object.entries(errors)) {
    const message = Array.isArray(value) ? value[0] : value
    if (!message) continue

    list.push(message)

    if (key === 'title') mapped.title = message
    if (key === 'description') mapped.description = message
    if (key === 'priority') mapped.priority = message
    if (key === 'task_status') mapped.task_status = message
    if (key === 'due_date') mapped.due_date = message
    if (key === 'assigned_to_user_id') mapped.assigned_to_user_id = message
    if (key === 'parent_task_id') mapped.parent_task_id = message
  }

  formErrors.value = mapped
  errorList.value = [...new Set(list)]
}

const fetchFarmUsers = async () => {
  try {
    if (!isOnline.value) {
      farmUsers.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: FarmUserRecord[] }>('/api/v1/farms/farm/users/list')
    farmUsers.value = response.data ?? []
  } catch (err) {
    console.error('Failed to fetch farm users for tasks:', err)
    farmUsers.value = []
  }
}

const fetchTasks = async () => {
  loading.value = true
  loadError.value = null

  try {
    if (!isOnline.value) {
      tasks.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: TaskRecord[] }>(`/api/v1/tasks/list/${taskableUuidValue.value}`, {
      params: { taskable_type: 'planting' }
    })
    tasks.value = response.data ?? []
  } catch (err: unknown) {
    loadError.value = err instanceof Error ? err.message : 'An error occurred while loading tasks'
    console.error('Failed to fetch tasks:', err)
    tasks.value = []
  } finally {
    loading.value = false
  }
}

const saveTask = async () => {
  if (!taskableUuidValue.value) return

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
    taskable_type: 'planting',
    taskable_uuid: taskableUuidValue.value
  }

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch('/api/v1/tasks', {
      method: 'POST',
      body: payload
    })

    await fetchTasks()
    resetForm()
    closeTaskModal()
  } catch (err: unknown) {
    const responseData = typeof err === 'object' && err !== null && 'data' in err
      ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
      : undefined

    setValidationErrors(responseData?.errors)
    submitError.value = responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save task')
    console.error('Failed to save task:', err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  resetForm()
  fetchFarmUsers()
  fetchTasks()
})
</script>