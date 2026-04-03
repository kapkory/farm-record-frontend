<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading animal types...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load animal types</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchData" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Animal Types</h3>
        <Button @click="openAddModal">
          <Plus class="w-4 h-4 mr-2" />
          Add Animal Type
        </Button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in animalTypes" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{{ item.category }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ item.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  item.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ item.status === 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editItem(item)" class="text-green-600 hover:text-green-900 mr-3">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="deleteItem(item.uuid)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="animalTypes.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No animal types found. Add your first animal type to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
        
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? 'Edit Animal Type' : 'Add Animal Type' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="submitForm" class="p-4 space-y-4">
              <div>
                <Label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Enter animal type name"
                  required
                  class="w-full"
                />
              </div>

              <div>
                <Label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category *</Label>
                <select
                  id="category"
                  v-model="form.category"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option v-for="category in animalCategories" :key="category" :value="category">{{ category }}</option>
                </select>
              </div>

              <div>
                <Label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  placeholder="Enter description"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
              </div>

              <!-- Tracking Mode -->
              <div>
                <Label for="tracking_mode" class="block text-sm font-medium text-gray-700 mb-1">How do you track these animals?</Label>
                <select
                  id="tracking_mode"
                  v-model="form.tracking_mode"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="both">Both — group count &amp; individual records</option>
                  <option value="group_only">Group count only (e.g. flocks, hives, fish)</option>
                  <option value="individual_only">Individual records only (e.g. tagged cows, horses)</option>
                </select>
                <p class="text-xs text-gray-400 mt-1">
                  <span v-if="form.tracking_mode === 'group_only'">You will record the total number in the group, but not individual animals.</span>
                  <span v-else-if="form.tracking_mode === 'individual_only'">Each animal gets its own record (name, tag, health history, etc.).</span>
                  <span v-else>You can track the full group count and also keep individual records.</span>
                </p>
              </div>

              <!-- Count Label -->
              <div>
                <Label for="count_label" class="block text-sm font-medium text-gray-700 mb-1">What do you call them?</Label>
                <Input
                  id="count_label"
                  v-model="form.count_label"
                  type="text"
                  placeholder="e.g. cows, birds, hives, fish"
                  maxlength="50"
                  class="w-full"
                />
                <p class="text-xs text-gray-400 mt-1">Used in reports — e.g. "12 <em>{{ form.count_label || 'animals' }}</em>"</p>
              </div>

              <div>
                <Label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</Label>
                <select
                  id="status"
                  v-model="form.status"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

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
                  <span v-else>{{ isEditing ? 'Update' : 'Add' }} Animal Type</span>
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
import { Plus, Pencil, Trash2, X } from 'lucide-vue-next'
// import mockData from '~/data/animals.json'

interface AnimalType {
  id: number
  uuid?: string
  name: string
  category: string
  description: string
  tracking_mode: 'group_only' | 'individual_only' | 'both'
  count_label: string
  status: 1 | 0
}

const animalCategories = ['livestock', 'poultry', 'apiculture', 'aquaculture']
const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const animalTypes = ref<AnimalType[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingUuid = ref<string | null>(null)

const form = ref({
  name: '',
  category: '',
  description: '',
  tracking_mode: 'both' as 'group_only' | 'individual_only' | 'both',
  count_label: '',
  status: 1 as 1 | 0
})

const resetForm = () => {
  form.value = { name: '', category: '', description: '', tracking_mode: 'both', count_label: '', status: 1 }
  isEditing.value = false
  editingUuid.value = null
}

const openAddModal = () => {
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const submitForm = async () => {
  submitting.value = true

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
    }

    if (isEditing.value && editingUuid.value) {
      if (isOnline.value) {
        const response = await $apiFetch<{ status: string; message: string; data: AnimalType }>(`/api/v1/settings/animals/animal-types/${editingUuid.value}`, {
          method: 'PUT',
          body: form.value
        })
        const index = animalTypes.value.findIndex(t => t.uuid === editingUuid.value)
        if (index !== -1) {
          animalTypes.value[index] = response.data
        }
      } else {
        const index = animalTypes.value.findIndex(t => t.uuid === editingUuid.value)
        if (index !== -1) {
          animalTypes.value[index] = { ...animalTypes.value[index], ...form.value } as AnimalType
        }
      }
    } else {
      let newItem: AnimalType
      if (isOnline.value) {
        const response = await $apiFetch<{ status: string; message: string; data: AnimalType }>('/api/v1/settings/animals/animal-types', {
          method: 'POST',
          body: form.value
        })
        newItem = response.data
      } else {
        newItem = { id: Date.now(), ...form.value } as AnimalType
      }
      animalTypes.value.push(newItem)
    }

    closeModal()
  } catch (err: any) {
    console.error('Failed to save animal type:', err)
    alert('Failed to save animal type: ' + (err.message || 'Unknown error'))
  } finally {
    submitting.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: AnimalType[] }>('/api/v1/settings/animals/animal-types/list')
      animalTypes.value = response.data || response as unknown as AnimalType[]
    } else {
      // Fallback to local JSON data when offline
      // animalTypes.value = mockData.animalTypes as AnimalType[]
    }
  } catch (err: any) {
    console.error('Failed to fetch animal types:', err)
    // Fallback to mock data on error
    // animalTypes.value = mockData.animalTypes as AnimalType[]
  } finally {
    loading.value = false
  }
}

const editItem = (item: AnimalType) => {
  isEditing.value = true
  editingUuid.value = item.uuid ?? null
  form.value = {
    name: item.name,
    category: item.category,
    description: item.description,
    tracking_mode: item.tracking_mode ?? 'both',
    count_label: item.count_label ?? '',
    status: item.status
  }
  showModal.value = true
}

const deleteItem = async (uuid?: string) => {
  if (!uuid || !confirm('Are you sure you want to delete this animal type?')) return

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch(`/api/v1/settings/animals/animal-types/${uuid}`, { method: 'DELETE' })
    }
    animalTypes.value = animalTypes.value.filter(item => item.uuid !== uuid)
  } catch (err: any) {
    console.error('Failed to delete:', err)
    alert('Failed to delete animal type')
  }
}

onMounted(() => {
  fetchData()
})
</script>
