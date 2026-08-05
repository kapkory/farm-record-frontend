<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900">Livestock</h3>
      <NuxtLink
        to="/admin/livestock/add"
        class="inline-flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Livestock
      </NuxtLink>
    </div>

    <div v-if="loading" class="py-10 text-center text-sm text-gray-500">Loading livestock…</div>

    <div v-else-if="loadError" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {{ loadError }}
      <button class="ml-1 underline" @click="fetchLivestock">Try again</button>
    </div>

    <div v-else-if="!livestock.length" class="py-10 text-center">
      <Beef class="w-10 h-10 text-amber-400 mx-auto mb-3" />
      <p class="text-sm text-gray-500">No livestock recorded for this farm yet.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name / Tag</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breed</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Checkup</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="animal in livestock" :key="animal.uuid" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <component :is="animal.tracking_type === 'group' ? Users : Beef" class="w-4 h-4" :class="animal.tracking_type === 'group' ? 'text-purple-500' : 'text-amber-500'" />
                <span class="text-sm font-medium text-gray-900">{{ animalLabel(animal) }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.animal_type?.name ?? '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.breed?.name ?? '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ animal.count ?? 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{{ animal.purpose ?? '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 py-1 text-xs font-semibold rounded-full capitalize', statusClass(animal.status)]">
                {{ animal.status ?? '—' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.last_checkup ?? '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink :to="`/admin/livestock/animal/${animal.uuid}`" class="text-green-600 hover:text-green-900 inline-flex">
                <Eye class="w-4 h-4" />
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Beef, Users, Eye } from 'lucide-vue-next'

interface LivestockRow {
  uuid: string
  tracking_type?: 'individual' | 'group'
  name?: string | null
  group_name?: string | null
  tag_number?: string | null
  animal_type?: { name?: string } | null
  breed?: { name?: string } | null
  count?: number
  purpose?: string | null
  status?: string | null
  last_checkup?: string | null
}

const route = useRoute()
const { $apiFetch } = useNuxtApp()
const farmUuid = String(route.params.uuid || '')

const livestock = ref<LivestockRow[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)

const animalLabel = (a: LivestockRow) =>
  (a.tracking_type === 'group' ? a.group_name : a.name) || a.tag_number || 'Unnamed'

const statusClass = (status?: string | null) => {
  const s = (status ?? '').toLowerCase()
  if (s === 'active' || s === 'healthy') return 'bg-green-100 text-green-800'
  if (s === 'sold' || s === 'sold_all' || s === 'archived') return 'bg-gray-100 text-gray-700'
  if (s === 'attention' || s === 'sick') return 'bg-amber-100 text-amber-800'
  return 'bg-blue-100 text-blue-800'
}

const fetchLivestock = async () => {
  loading.value = true
  loadError.value = null
  try {
    const res = await $apiFetch<any>(`/api/v1/farms/farm/animals/livestocks/list/${farmUuid}`)
    livestock.value = (res?.data ?? res) ?? []
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Failed to load livestock'
    console.error('Failed to load farm livestock:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLivestock)
</script>
