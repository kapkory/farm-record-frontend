<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-gray-900">Tasks</h3>
          <p class="mt-0.5 text-sm text-gray-500">Track work to be done for this animal, who is responsible, and the current progress.</p>
        </div>
        <Button type="button" @click="openModal" class="inline-flex items-center gap-2">
          <Plus class="h-4 w-4" />
          New Task
        </Button>
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
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {{ task.assignee?.name || task.assignee?.email || '—' }}
                </td>
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
                <td class="whitespace-nowrap px-6 py-3 text-sm text-gray-500">
                  {{ sub.assignee?.name || sub.assignee?.email || '—' }}
                </td>
              </tr>
            </template>
            <tr v-if="!tasks.length">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No tasks found. Add the first task above.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">New Task</h3>
                <p class="mt-1 text-sm text-gray-500">Capture what needs to be done, when it is due, and who should handle it.</p>
              </div>
              <button type="button" @click="closeModal" class="text-gray-400 transition-colors hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="saveTask" class="space-y-4 p-5">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Task Title</Label>
                  <Input v-model="taskForm.title" type="text" class="w-full" placeholder="e.g. Administer monthly deworming" />
                  <p v-if="formErrors.title" class="mt-1 text-xs text-red-600">{{ formErrors.title }}</p>
                </div>

                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Due Date</Label>
                  <Input v-model="taskForm.due_date" type="date" class="w-full" />
                  <p v-if="formErrors.due_date" class="mt-1 text-xs text-red-600">{{ formErrors.due_date }}</p>
                </div>

                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Priority</Label>
                  <select
                    v-model="taskForm.priority"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option v-for="option in priorityOptions" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
                  </select>
                  <p v-if="formErrors.priority" class="mt-1 text-xs text-red-600">{{ formErrors.priority }}</p>
                </div>

                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Status</Label>
                  <select
                    v-model="taskForm.task_status"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option v-for="option in statusOptions" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
                  </select>
                  <p v-if="formErrors.task_status" class="mt-1 text-xs text-red-600">{{ formErrors.task_status }}</p>
                </div>

                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Assigned To</Label>
                  <select
                    v-model="taskForm.assigned_to_user_id"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Unassigned</option>
                    <option v-for="user in farmUsers" :key="user.id" :value="String(user.id)">
                      {{ user.name || user.email || `User ${user.id}` }}
                    </option>
                  </select>
                  <p v-if="formErrors.assigned_to_user_id" class="mt-1 text-xs text-red-600">{{ formErrors.assigned_to_user_id }}</p>
                </div>

                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Parent Task</Label>
                  <select
                    v-model="taskForm.parent_task_id"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">No parent task</option>
                    <option v-for="parent in parentTaskOptions" :key="parent.id ?? parent.uuid" :value="String(parent.id)">
                      {{ parent.title || 'Untitled task' }}
                    </option>
                  </select>
                  <p v-if="formErrors.parent_task_id" class="mt-1 text-xs text-red-600">{{ formErrors.parent_task_id }}</p>
                </div>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Description</Label>
                <textarea
                  v-model="taskForm.description"
                  rows="3"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Explain the work clearly in simple words"
                ></textarea>
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
                <button
                  type="button"
                  @click="closeModal"
                  class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
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

const props = defineProps<{ animalUuid: string }>()

const {
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
} = useAnimalTasks(props.animalUuid)
</script>
