<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading farm...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
      <p class="font-medium">Failed to load farm</p>
      <p class="mt-1 text-sm">{{ loadError }}</p>
    </div>

    <template v-else>
    <!-- Farm Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
            <Warehouse class="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ farm.name }}</h1>
            <p class="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin class="w-4 h-4" />
              {{ farm.location }}
            </p>
            <div class="flex items-center gap-3 mt-2">
              <span :class="[
                'px-2 py-1 text-xs font-semibold rounded-full',
                farm.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ farm.status }}
              </span>
              <span v-if="farm.size" class="text-sm text-gray-500">{{ farm.size }} {{ farm.size_unit }}</span>
              <span v-if="farm.size && farm.type" class="text-sm text-gray-500">•</span>
              <span v-if="farm.type" class="text-sm text-gray-500">{{ farm.type }}</span>
            </div>
            <p v-if="farm.owner" class="mt-1 text-sm text-gray-500">Owner: {{ farm.owner }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <Button class="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
            <Pencil class="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button class="bg-red-500 hover:bg-red-600">
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Sprout class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ farm.total_plantings ?? '—' }}</p>
            <p class="text-sm text-gray-500">Active Plantings</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Beef class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ farm.total_livestocks ?? '—' }}</p>
            <p class="text-sm text-gray-500">Livestock</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Ruler class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ farm.total_area_planted ?? '—' }}</p>
            <p class="text-sm text-gray-500">Area Planted</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <CalendarDays class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ farm.next_harvest_date ?? '—' }}</p>
            <p class="text-sm text-gray-500">Next Harvest</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <Fields v-if="activeTab === 'fields'" />
        <Plantings v-if="activeTab === 'plantings'" />
        <Livestock v-if="activeTab === 'livestock'" />
      </div>
    </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { 
  Warehouse, MapPin, Pencil, Trash2, Sprout, Beef, 
  Ruler, CalendarDays
} from 'lucide-vue-next'

import Fields from '~/components/farms/farm/tabs/Fields.vue'
import Plantings from '~/components/farms/farm/tabs/Plantings.vue'
import Livestock from '~/components/farms/farm/tabs/Livestock.vue'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

interface FarmData {
  uuid?: string
  name?: string
  location?: string
  size?: string | number
  size_unit?: string
  type?: string
  status?: string
  owner?: string
  created_at?: string
  created_at_human?: string
  total_plantings?: number
  total_livestocks?: number
  total_area_planted?: string | number
  next_harvest_date?: string
  [key: string]: unknown
}

const route = useRoute()
const { $apiFetch } = useNuxtApp()
const farmId = route.params.uuid

const loading = ref(true)
const loadError = ref<string | null>(null)
const farm = ref<FarmData>({})

onMounted(async () => {
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: FarmData }>(`/api/v1/farms/farm/${farmId}`)
    console.log(response)
    farm.value = response.data ?? (response as unknown as FarmData)
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Failed to load farm'
    console.error('Failed to fetch farm:', err)
  } finally {
    loading.value = false
  }
})

// Tabs configuration
const tabs = [
  { id: 'fields', label: 'Fields', icon: Sprout },
  { id: 'plantings', label: 'Plantings', icon: Sprout },
  { id: 'livestock', label: 'Livestock', icon: Beef }
]

const activeTab = ref('plantings')
</script>