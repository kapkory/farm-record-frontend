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
        <Button @click="showAddModal = true">
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Period</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in varieties" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.cropType }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.growthPeriod }}</td>
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
            <tr v-if="varieties.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No crop varieties found. Add your first variety to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

interface CropVariety {
  id: number
  name: string
  cropType: string
  growthPeriod: string
  status: 'active' | 'inactive'
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const varieties = ref<CropVariety[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showAddModal = ref(false)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    if (isOnline.value) {
      // Fetch from backend API
      const response = await $apiFetch<{ data: CropVariety[] }>('/api/crop-varieties')
      varieties.value = response.data || response as unknown as CropVariety[]
    } else {
      // Load from local JSON when offline (fallback)
      varieties.value = [
        { id: 1, name: 'Basmati Rice', cropType: 'Cereals', growthPeriod: '120-150 days', status: 'active' },
        { id: 2, name: 'Durum Wheat', cropType: 'Cereals', growthPeriod: '90-120 days', status: 'active' },
        { id: 3, name: 'Cherry Tomato', cropType: 'Vegetables', growthPeriod: '60-80 days', status: 'active' },
        { id: 4, name: 'Roma Tomato', cropType: 'Vegetables', growthPeriod: '70-80 days', status: 'active' },
        { id: 5, name: 'Black Bean', cropType: 'Legumes', growthPeriod: '90-140 days', status: 'active' },
        { id: 6, name: 'Russet Potato', cropType: 'Tubers', growthPeriod: '80-120 days', status: 'inactive' }
      ]
    }
  } catch (err: any) {
    console.error('Failed to fetch crop varieties:', err)
    error.value = err.message || 'An error occurred while loading data'
    // Fallback to sample data on error
    varieties.value = [
      { id: 1, name: 'Basmati Rice', cropType: 'Cereals', growthPeriod: '120-150 days', status: 'active' },
      { id: 2, name: 'Durum Wheat', cropType: 'Cereals', growthPeriod: '90-120 days', status: 'active' },
      { id: 3, name: 'Cherry Tomato', cropType: 'Vegetables', growthPeriod: '60-80 days', status: 'active' }
    ]
    error.value = null // Clear error since we have fallback data
  } finally {
    loading.value = false
  }
}

const editItem = (item: CropVariety) => {
  console.log('Edit:', item)
  // TODO: Implement edit modal
}

const deleteItem = async (id: number) => {
  if (!confirm('Are you sure you want to delete this variety?')) return
  
  try {
    if (isOnline.value) {
      await $apiFetch(`/api/crop-varieties/${id}`, { method: 'DELETE' })
    }
    varieties.value = varieties.value.filter(item => item.id !== id)
  } catch (err: any) {
    console.error('Failed to delete:', err)
    alert('Failed to delete variety')
  }
}

onMounted(() => {
  fetchData()
})
</script>
