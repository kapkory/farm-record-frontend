<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading plantings...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load plantings</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchPlantings" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Plantings Table -->
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Plantings</h3>
        <NuxtLink
          to="/admin/farms/farm/new-planting"
          class="inline-flex items-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
        >
          <Plus class="w-4 h-4 mr-2" /> Add Planting
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Planted</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="planting in plantings" :key="planting.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <Sprout class="w-4 h-4 text-green-500" />
                  <span class="text-sm font-medium text-gray-900">{{ planting.crop ?? '—' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.variety ?? '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.field ?? '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.date_planted }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.quantity_planted ?? '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                  {{ planting.purpose ?? '—' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full capitalize',
                  planting.status === 'growing'    ? 'bg-green-100 text-green-800' :
                  planting.status === 'harvesting' ? 'bg-amber-100 text-amber-800' :
                  planting.status === 'completed'  ? 'bg-blue-100 text-blue-800'  : 'bg-gray-100 text-gray-800'
                ]">
                  {{ planting.status ?? 'active' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <!-- <button class="text-green-600 hover:text-green-900 mr-3" title="View">
                  <Eye class="w-4 h-4" />
                </button> -->
                <a :href="`/admin/farms/farm/planting/${planting.uuid}`" 
                class="inline-flex items-center text-green-600 hover:text-green-900 mr-3" title="View">
                  <Eye class="w-4 h-4" />
                </a>
                <button class="text-gray-600 hover:text-gray-900" title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="plantings.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                No plantings found. Add the first planting to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Plus, Sprout, Eye, Pencil } from 'lucide-vue-next'

interface Planting {
  id: number
  uuid?: string
  date_planted: string
  quantity_planted: number | null
  purpose: string | null
  status: string | null
  crop?: string 
  variety?: string 
  field?: string
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const route = useRoute()

const farmUuid = computed(() => route.params.uuid as string)

const plantings = ref<Planting[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchPlantings = async () => {
  loading.value = true
  error.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Planting[] }>(`/api/v1/farms/farm/plantings/list/${farmUuid.value}`)
      plantings.value = response.data ?? (response as unknown as Planting[])
    } else {
      plantings.value = []
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading plantings'
    console.error('Failed to fetch plantings:', err)
    error.value = errorMessage
    plantings.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlantings()
})
</script>