<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading crop types...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load crop types</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchData" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Crop Types</h3>
        <Button @click="openAddModal">
          <Plus class="w-4 h-4 mr-2" />
          Add Type
        </Button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in cropTypes" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ item.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ item.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editItem(item)" class="text-green-600 hover:text-green-900 mr-3">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="deleteItem(item.id)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="cropTypes.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No crop types found. Add your first crop type to get started.
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
                {{ isEditing ? 'Edit Crop Type' : 'Add Crop Type' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitForm" class="p-4 space-y-4">
              <!-- Name -->
              <div>
                <Label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Enter crop type name"
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
                  placeholder="Enter description"
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
                  <span v-else>{{ isEditing ? 'Update' : 'Add' }} Crop Type</span>
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

interface CropType {
  id: number
  name: string
  description: string
  status: 'active' | 'inactive'
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const cropTypes = ref<CropType[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive'
})

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    status: 'active'
  }
  isEditing.value = false
  editingId.value = null
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
    if (isEditing.value && editingId.value) {
      // Update existing
      if (isOnline.value) {
        await $apiFetch(`/api/crop-types/${editingId.value}`, {
          method: 'PUT',
          body: form.value
        })
      }
      // Update local list
      const index = cropTypes.value.findIndex(c => c.id === editingId.value)
      if (index !== -1) {
        cropTypes.value[index] = { ...cropTypes.value[index], ...form.value }
      }
    } else {
      // Create new
      let newItem: CropType
      if (isOnline.value) {
        const response = await $apiFetch<CropType>('/api/crop-types', {
          method: 'POST',
          body: form.value
        })
        newItem = response
      } else {
        // Offline: generate temporary ID
        newItem = {
          id: Date.now(),
          ...form.value
        }
      }
      cropTypes.value.push(newItem)
    }
    
    closeModal()
  } catch (err: any) {
    console.error('Failed to save crop type:', err)
    alert('Failed to save crop type: ' + (err.message || 'Unknown error'))
  } finally {
    submitting.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    if (isOnline.value) {
      // Fetch from backend API
      const response = await $apiFetch<{ data: CropType[] }>('/api/crop-types')
      cropTypes.value = response.data || response as unknown as CropType[]
    } else {
      // Load from local JSON when offline (fallback)
      cropTypes.value = [
        { id: 1, name: 'Cereals', description: 'Grains like wheat, rice, maize', status: 'active' },
        { id: 2, name: 'Legumes', description: 'Beans, lentils, peas', status: 'active' },
        { id: 3, name: 'Vegetables', description: 'Leafy greens, root vegetables', status: 'active' },
        { id: 4, name: 'Fruits', description: 'Tree and vine fruits', status: 'active' },
        { id: 5, name: 'Tubers', description: 'Potatoes, cassava, yams', status: 'inactive' }
      ]
    }
  } catch (err: any) {
    console.error('Failed to fetch crop types:', err)
    error.value = err.message || 'An error occurred while loading data'
    // Fallback to sample data on error
    cropTypes.value = [
      { id: 1, name: 'Cereals', description: 'Grains like wheat, rice, maize', status: 'active' },
      { id: 2, name: 'Legumes', description: 'Beans, lentils, peas', status: 'active' },
      { id: 3, name: 'Vegetables', description: 'Leafy greens, root vegetables', status: 'active' }
    ]
    error.value = null // Clear error since we have fallback data
  } finally {
    loading.value = false
  }
}

const editItem = (item: CropType) => {
  isEditing.value = true
  editingId.value = item.id
  form.value = {
    name: item.name,
    description: item.description,
    status: item.status
  }
  showModal.value = true
}

const deleteItem = async (id: number) => {
  if (!confirm('Are you sure you want to delete this crop type?')) return
  
  try {
    if (isOnline.value) {
      await $apiFetch(`/api/crop-types/${id}`, { method: 'DELETE' })
    }
    cropTypes.value = cropTypes.value.filter(item => item.id !== id)
  } catch (err: any) {
    console.error('Failed to delete:', err)
    alert('Failed to delete crop type')
  }
}

onMounted(() => {
  fetchData()
})
</script>
