<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading crop varieties...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load crop varieties</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchData" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Crop Varieties</h3>
        <Button @click="openAddModal">
          <Plus class="w-4 h-4 mr-2" />
          Add Variety
        </Button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity Days</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Yield</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Type</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in varieties" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.crop?.name || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.maturity_days }} days</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.expected_yield || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.harvest_type || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editItem(item)" class="text-green-600 hover:text-green-900 mr-3">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="deleteItem(item.uuid)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="varieties.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No crop varieties found. Add your first variety to get started.
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
                {{ isEditing ? 'Edit Variety' : 'Add Variety' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitForm" class="p-4 space-y-4">
              <!-- Crop -->
              <div>
                <Label for="crop_id" class="block text-sm font-medium text-gray-700 mb-1">Crop *</Label>
                <select
                  id="crop_id"
                  v-model="form.crop_id"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a crop</option>
                  <option v-for="crop in crops" :key="crop.id" :value="crop.id">{{ crop.name }}</option>
                </select>
              </div>

              <!-- Name -->
              <div>
                <Label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Enter variety name"
                  required
                  class="w-full"
                />
              </div>

              <!-- Maturity Days -->
              <div>
                <Label for="maturity_days" class="block text-sm font-medium text-gray-700 mb-1">Maturity Days *</Label>
                <Input
                  id="maturity_days"
                  v-model.number="form.maturity_days"
                  type="number"
                  placeholder="Enter maturity days"
                  required
                  min="1"
                  max="255"
                  class="w-full"
                />
              </div>

              <!-- Expected Yield -->
              <div>
                <Label for="expected_yield" class="block text-sm font-medium text-gray-700 mb-1">Expected Yield</Label>
                <Input
                  id="expected_yield"
                  v-model.number="form.expected_yield"
                  type="number"
                  placeholder="Enter expected yield"
                  min="0"
                  max="255"
                  class="w-full"
                />
              </div>

              <!-- Harvest Type -->
              <div>
                <Label for="harvest_type" class="block text-sm font-medium text-gray-700 mb-1">Harvest Type</Label>
                <Input
                  id="harvest_type"
                  v-model="form.harvest_type"
                  type="text"
                  placeholder="Enter harvest type"
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
                  <span v-else>{{ isEditing ? 'Update' : 'Add' }} Variety</span>
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

interface Crop {
  id: number
  name: string
}

interface CropVariety {
  id: number
  uuid?: string
  crop_id: number
  name: string
  maturity_days: number
  expected_yield: number | null
  description: string | null
  harvest_type: string | null
  crop?: Crop
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const varieties = ref<CropVariety[]>([])
const crops = ref<Crop[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingUuid = ref<string | null>(null)

const form = ref({
  crop_id: '' as number | '',
  name: '',
  maturity_days: '' as number | '',
  expected_yield: '' as number | '',
  description: '',
  harvest_type: ''
})

const resetForm = () => {
  form.value = {
    crop_id: '',
    name: '',
    maturity_days: '',
    expected_yield: '',
    description: '',
    harvest_type: ''
  }
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
    // Fetch CSRF cookie first
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
    }

    const payload = {
      crop_id: form.value.crop_id,
      name: form.value.name,
      maturity_days: form.value.maturity_days,
      expected_yield: form.value.expected_yield || null,
      description: form.value.description || null,
      harvest_type: form.value.harvest_type || null
    }

    if (isEditing.value && editingUuid.value) {
      // Update existing
      if (isOnline.value) {
        const response = await $apiFetch<{ status: string; message: string; data: CropVariety }>(`/api/v1/settings/crops/varieties/${editingUuid.value}`, {
          method: 'PUT',
          body: payload
        })
        // Update local list with server response
        const index = varieties.value.findIndex(v => v.uuid === editingUuid.value)
        if (index !== -1) {
          varieties.value[index] = response.data
        }
      } else {
        // Update local list when offline
        const index = varieties.value.findIndex(v => v.uuid === editingUuid.value)
        if (index !== -1) {
          varieties.value[index] = { ...varieties.value[index], ...payload } as CropVariety
        }
      }
    } else {
      // Create new
      let newItem: CropVariety
      if (isOnline.value) {
        const response = await $apiFetch<{ status: string; message: string; data: CropVariety }>('/api/v1/settings/crops/varieties', {
          method: 'POST',
          body: payload
        })
        newItem = response.data
      } else {
        // Offline: generate temporary ID (UUID will be assigned by server when synced)
        newItem = {
          id: Date.now(),
          ...payload
        } as CropVariety
      }
      varieties.value.push(newItem)
    }
    
    closeModal()
  } catch (err: any) {
    console.error('Failed to save variety:', err)
    alert('Failed to save variety: ' + (err.message || 'Unknown error'))
  } finally {
    submitting.value = false
  }
}

const fetchCrops = async () => {
  try {
    if (isOnline.value) {
      // Fetch CSRF cookie first
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Crop[] }>('/api/v1/settings/crops/list')
      console.log('Fetched crops:', response.data)
      crops.value = response.data || response as unknown as Crop[]
    }
  } catch (err: any) {
    console.error('Failed to fetch crops:', err)
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    if (isOnline.value) {
      // Fetch CSRF cookie first
      await $apiFetch('/sanctum/csrf-cookie')
      // Fetch from backend API
      const response = await $apiFetch<{ data: CropVariety[] }>('/api/v1/settings/crops/varieties/list')
      varieties.value = response.data || response as unknown as CropVariety[]
    } else {
      // Load empty when offline
      varieties.value = []
    }
  } catch (err: any) {
    console.error('Failed to fetch crop varieties:', err)
    error.value = err.message || 'An error occurred while loading data'
    varieties.value = []
    error.value = null
  } finally {
    loading.value = false
  }
}

const editItem = (item: CropVariety) => {
  isEditing.value = true
  editingUuid.value = item.uuid
  form.value = {
    crop_id: item.crop_id,
    name: item.name,
    maturity_days: item.maturity_days,
    expected_yield: item.expected_yield || '',
    description: item.description || '',
    harvest_type: item.harvest_type || ''
  }
  showModal.value = true
}

const deleteItem = async (uuid: string) => {
  if (!confirm('Are you sure you want to delete this variety?')) return
  
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch(`/api/v1/settings/crops/varieties/${uuid}`, { method: 'DELETE' })
    }
    varieties.value = varieties.value.filter(item => item.uuid !== uuid)
  } catch (err: any) {
    console.error('Failed to delete:', err)
    alert('Failed to delete variety')
  }
}

onMounted(() => {
  fetchCrops()
  fetchData()
})
</script>
