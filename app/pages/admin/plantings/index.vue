<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">All Plantings</h1>
        <p class="mt-1 text-sm text-gray-500">View every farmer planting record in one place.</p>
      </div>
      <NuxtLink
        to="/admin/farms/farm/new-planting"
        class="inline-flex items-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
      >
        <Plus class="mr-2 h-4 w-4" />
        Add Planting
      </NuxtLink>
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Total Plantings</p>
        <p class="mt-1 text-2xl font-bold text-gray-900">{{ plantings.length }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Growing</p>
        <p class="mt-1 text-2xl font-bold text-green-600">{{ growingCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Harvesting</p>
        <p class="mt-1 text-2xl font-bold text-amber-600">{{ harvestingCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Completed</p>
        <p class="mt-1 text-2xl font-bold text-blue-600">{{ completedCount }}</p>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4">
        <div class="relative max-w-md">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            v-model="search"
            type="search"
            placeholder="Search by crop, variety, field or farmer"
            class="pl-9"
          />
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading plantings...</span>
      </div>

      <div v-else-if="error" class="rounded-b-lg bg-red-50 p-4 text-red-700">
        <p class="font-medium">Failed to load plantings</p>
        <p class="mt-1 text-sm">{{ error }}</p>
        <button @click="fetchPlantings" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Crop</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Variety</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Field</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Farmer / Farm</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date Planted</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Purpose</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="planting in filteredPlantings"
              :key="planting.id"
              class="cursor-pointer hover:bg-gray-50"
              @click="openPlanting(planting.uuid)"
            >
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-2">
                  <Sprout class="h-4 w-4 text-green-500" />
                  <span class="text-sm font-medium text-gray-900">{{ planting.crop ?? '—' }}</span>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ planting.variety ?? '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ planting.field ?? '—' }}</td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-gray-900">{{ planting.farmer ?? planting.farm ?? '—' }}</p>
                <p v-if="planting.farmer && planting.farm" class="text-xs text-gray-500">{{ planting.farm }}</p>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ planting.date_planted }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ planting.quantity_planted ?? '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold capitalize text-gray-700">
                  {{ planting.purpose ?? '—' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="statusClass(planting.status)">
                  {{ planting.status ?? 'active' }}
                </span>
              </td>
            </tr>
            <tr v-if="!filteredPlantings.length">
              <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                No plantings found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Plus, Search, Sprout } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

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
  farm?: string
  farmer?: string
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const router = useRouter()

const plantings = ref<Planting[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')

const filteredPlantings = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return plantings.value

  return plantings.value.filter((planting) => {
    return [
      planting.crop,
      planting.variety,
      planting.field,
      planting.farm,
      planting.farmer,
      planting.purpose,
      planting.status,
    ].some((value) => (value ?? '').toLowerCase().includes(query))
  })
})

const growingCount = computed(() => plantings.value.filter((planting) => planting.status === 'growing').length)
const harvestingCount = computed(() => plantings.value.filter((planting) => planting.status === 'harvesting').length)
const completedCount = computed(() => plantings.value.filter((planting) => planting.status === 'completed').length)

const statusClass = (status: string | null) => {
  const base = 'px-2 py-1 text-xs font-semibold rounded-full capitalize'

  if (status === 'growing') return `${base} bg-green-100 text-green-800`
  if (status === 'harvesting') return `${base} bg-amber-100 text-amber-800`
  if (status === 'completed') return `${base} bg-blue-100 text-blue-800`
  return `${base} bg-gray-100 text-gray-800`
}

const openPlanting = (uuid?: string) => {
  if (!uuid) return
  router.push(`/admin/farms/farm/planting/${uuid}`)
}

const fetchPlantings = async () => {
  loading.value = true
  error.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Planting[] }>('/api/v1/farms/farm/plantings/list')
      plantings.value = response.data ?? (response as unknown as Planting[])
    } else {
      plantings.value = []
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An error occurred while loading plantings'
    console.error('Failed to fetch plantings:', err)
    plantings.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlantings()
})
</script>