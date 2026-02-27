<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading fields...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load fields</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchFields" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Fields Table -->
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Farm Fields</h3>
        <Button @click="openAddModal">
          <Plus class="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="field in fields" :key="field.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <Sprout class="w-4 h-4 text-green-500" />
                  <span class="text-sm font-medium text-gray-900">{{ field.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ field.size }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ field.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  field.is_active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                ]">
                  {{ field.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openEditModal(field)" class="text-green-600 hover:text-green-900 mr-3">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="deleteField(field.uuid)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="fields.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No fields found. Add your first field to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
        
        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? 'Edit Field' : 'Add Field' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitForm" class="p-4 space-y-4">
              <!-- Hidden ID field for edit mode -->
              <input type="hidden" v-model="form.id" />

              <!-- Name -->
              <div>
                <Label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Enter field name"
                  required
                  class="w-full"
                />
              </div>

              <!-- Size -->
              <div>
                <Label for="size" class="block text-sm font-medium text-gray-700 mb-1">Size</Label>
                <Input
                  id="size"
                  v-model="form.size"
                  type="text"
                  placeholder="e.g., 10 acres, 5 hectares"
                  required
                  class="w-full"
                />
              </div>

              <!-- Description -->
              <div>
                <Label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  placeholder="Enter field description"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
              </div>

              <!-- Status -->
              <div>
                <Label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</Label>
                <select
                  id="status"
                  v-model="form.status"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting" class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </span>
                  <span v-else>{{ isEditing ? 'Update' : 'Add' }} Field</span>
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
import { Plus, Pencil, Trash2, X, Sprout } from 'lucide-vue-next'

interface Field {
  id: number
  uuid?: string
  name: string
  size: string
  description: string
  is_active: boolean
}

interface FormState {
  id: string
  name: string
  size: string
  description: string
  status: 'active' | 'inactive'
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const route = useRoute()

// Get farm UUID from route params
const farmUuid = computed(() => route.params.uuid as string)

// State
const fields = ref<Field[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const submitting = ref(false)

// Form state - empty id means create, filled id means edit
const form = ref<FormState>({
  id: '',
  name: '',
  size: '',
  description: '',
  status: 'active'
})

// Computed: check if we're editing based on id presence
const isEditing = computed(() => form.value.id !== '')

// Reset form to initial state
const resetForm = () => {
  form.value = {
    id: '',
    name: '',
    size: '',
    description: '',
    status: 'active'
  }
}

// Open modal for adding new field
const openAddModal = () => {
  resetForm()
  showModal.value = true
}

// Open modal for editing existing field
const openEditModal = (field: Field) => {
  form.value = {
    id: field.uuid ?? String(field.id),
    name: field.name,
    size: field.size,
    description: field.description,
    status: field.is_active ? 'active' : 'inactive'
  }
  showModal.value = true
}

// Close modal and reset form
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// Fetch fields from API
const fetchFields = async () => {
  loading.value = true
  error.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Field[] }>(`/api/v1/farms/fields/list/${farmUuid.value}`)
      fields.value = response.data ?? (response as unknown as Field[])
    } else {
      // Offline fallback - could load from IndexedDB if implemented
      fields.value = []
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading fields'
    console.error('Failed to fetch fields:', err)
    error.value = errorMessage
    fields.value = []
  } finally {
    loading.value = false
  }
}

// Submit form (create or update)
const submitForm = async () => {
  submitting.value = true

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
    }

    if (isEditing.value) {
      // Update existing field
      const payload = {
        name: form.value.name,
        size: form.value.size,
        uuid: form.value.id,
        farm_uuid: farmUuid.value,
        description: form.value.description,
        is_active: form.value.status === 'active'
      }

      if (isOnline.value) {
        const response = await $apiFetch<{ status: string; message: string; data: Field }>(
          `/api/v1/farms/fields/${farmUuid.value}`,
          { method: 'POST', body: payload }
        )
        // Update local list with server response
        const index = fields.value.findIndex(f => (f.uuid ?? String(f.id)) === form.value.id)
        if (index !== -1) {
          fields.value[index] = response.data
        }
      } else {
        // Offline update
        const index = fields.value.findIndex(f => (f.uuid ?? String(f.id)) === form.value.id)
        if (index !== -1) {
          fields.value[index] = { ...fields.value[index], ...payload }
        }
      }
    } else {
      // Create new field
      const payload = {
        name: form.value.name,
        size: form.value.size,
        description: form.value.description,
        uuid: null,
        farm_uuid: farmUuid.value,
        is_active: form.value.status === 'active'
      }

      let newField: Field

      if (isOnline.value) {
        const response = await $apiFetch<{ status: string; message: string; data: Field }>(
          `/api/v1/farms/fields/${farmUuid.value}`,
          { method: 'POST', body: payload }
        )
        newField = response.data
      } else {
        // Offline: generate temporary ID
        newField = {
          id: Date.now(),
          ...payload
        }
      }

      fields.value.push(newField)
    }

    closeModal()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to save field:', err)
    alert(`Failed to save field: ${errorMessage}`)
  } finally {
    submitting.value = false
  }
}

// Delete field
const deleteField = async (uuid?: string) => {
  if (!uuid) return
  if (!confirm('Are you sure you want to delete this field?')) return

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch(`/api/v1/farms/${farmUuid.value}/fields/${uuid}`, { method: 'DELETE' })
    }
    fields.value = fields.value.filter(field => field.uuid !== uuid)
  } catch (err: unknown) {
    console.error('Failed to delete field:', err)
    alert('Failed to delete field')
  }
}

// Fetch fields on mount
onMounted(() => {
  fetchFields()
})
</script> 