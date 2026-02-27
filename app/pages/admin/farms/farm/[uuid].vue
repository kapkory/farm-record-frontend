<template>
  <div class="space-y-6">
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
              <span class="text-sm text-gray-500">{{ farm.size }}</span>
              <span class="text-sm text-gray-500">•</span>
              <span class="text-sm text-gray-500">{{ farm.type }}</span>
            </div>
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
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalPlantings }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalLivestock }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ stats.areaPlanted }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ stats.nextHarvest }}</p>
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
            <span :class="[
              'px-2 py-0.5 text-xs rounded-full',
              activeTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            ]">
              {{ tab.count }}
            </span>
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
  </div>
</template>

<script lang="ts" setup>
import { 
  Warehouse, MapPin, Pencil, Trash2, Sprout, Beef, 
  Ruler, CalendarDays, Plus, Eye 
} from 'lucide-vue-next'

import Fields from '~/components/farms/farm/tabs/Fields.vue'
import Plantings from '~/components/farms/farm/tabs/Plantings.vue'
import Livestock from '~/components/farms/farm/tabs/Livestock.vue'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

const route = useRoute()
const farmId = route.params.uuid

// Dummy farm data
const farm = ref({
  id: farmId,
  name: 'Green Valley Farm',
  location: 'Kiambu County, Kenya',
  size: '50 acres',
  type: 'Mixed Farming',
  status: 'active',
  owner: 'John Kamau',
  createdAt: '2024-03-15'
})

// Stats summary
const stats = ref({
  totalPlantings: 8,
  totalLivestock: 156,
  areaPlanted: '35 acres',
  nextHarvest: '15 days'
})

// Tabs configuration
const tabs = [
  { id: 'fields', label: 'Fields', icon: Sprout, count: 0 },
  { id: 'plantings', label: 'Plantings', icon: Sprout, count: 8 },
  { id: 'livestock', label: 'Livestock', icon: Beef, count: 5 }
]

const activeTab = ref('plantings')
</script>