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
        <!-- Plantings Tab -->
        <div v-if="activeTab === 'plantings'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Plantings Summary</h3>
            <Button>
              <Plus class="w-4 h-4 mr-2" />
              Add Planting
            </Button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planted Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Harvest</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="planting in plantings" :key="planting.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <Sprout class="w-4 h-4 text-green-500" />
                      <span class="text-sm font-medium text-gray-900">{{ planting.crop }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.variety }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.area }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.plantedDate }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ planting.expectedHarvest }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      planting.status === 'growing' ? 'bg-green-100 text-green-800' :
                      planting.status === 'harvesting' ? 'bg-amber-100 text-amber-800' :
                      planting.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    ]">
                      {{ planting.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-green-600 hover:text-green-900 mr-3">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button class="text-gray-600 hover:text-gray-900">
                      <Pencil class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Livestock Tab -->
        <div v-if="activeTab === 'livestock'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Livestock Summary</h3>
            <Button>
              <Plus class="w-4 h-4 mr-2" />
              Add Livestock
            </Button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breed</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Checkup</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="animal in livestock" :key="animal.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <Beef class="w-4 h-4 text-amber-500" />
                      <span class="text-sm font-medium text-gray-900">{{ animal.type }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.breed }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ animal.count }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.purpose }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      animal.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                      animal.healthStatus === 'attention' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    ]">
                      {{ animal.healthStatus }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ animal.lastCheckup }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-green-600 hover:text-green-900 mr-3">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button class="text-gray-600 hover:text-gray-900">
                      <Pencil class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { 
  Warehouse, MapPin, Pencil, Trash2, Sprout, Beef, 
  Ruler, CalendarDays, Plus, Eye 
} from 'lucide-vue-next'

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
  { id: 'plantings', label: 'Plantings', icon: Sprout, count: 8 },
  { id: 'livestock', label: 'Livestock', icon: Beef, count: 5 }
]

const activeTab = ref('plantings')

// Dummy plantings data
const plantings = ref([
  {
    id: 1,
    crop: 'Maize',
    variety: 'H614D',
    area: '10 acres',
    plantedDate: 'Oct 15, 2025',
    expectedHarvest: 'Feb 10, 2026',
    status: 'growing'
  },
  {
    id: 2,
    crop: 'Beans',
    variety: 'Rose Coco',
    area: '5 acres',
    plantedDate: 'Nov 01, 2025',
    expectedHarvest: 'Jan 30, 2026',
    status: 'harvesting'
  },
  {
    id: 3,
    crop: 'Tomatoes',
    variety: 'Roma VF',
    area: '2 acres',
    plantedDate: 'Dec 05, 2025',
    expectedHarvest: 'Mar 15, 2026',
    status: 'growing'
  },
  {
    id: 4,
    crop: 'Cabbage',
    variety: 'Copenhagen',
    area: '3 acres',
    plantedDate: 'Sep 20, 2025',
    expectedHarvest: 'Jan 20, 2026',
    status: 'completed'
  },
  {
    id: 5,
    crop: 'Potatoes',
    variety: 'Shangi',
    area: '8 acres',
    plantedDate: 'Oct 25, 2025',
    expectedHarvest: 'Feb 25, 2026',
    status: 'growing'
  }
])

// Dummy livestock data
const livestock = ref([
  {
    id: 1,
    type: 'Cattle',
    breed: 'Friesian',
    count: 25,
    purpose: 'Dairy',
    healthStatus: 'healthy',
    lastCheckup: 'Jan 10, 2026'
  },
  {
    id: 2,
    type: 'Goats',
    breed: 'Galla',
    count: 40,
    purpose: 'Meat',
    healthStatus: 'healthy',
    lastCheckup: 'Jan 05, 2026'
  },
  {
    id: 3,
    type: 'Poultry',
    breed: 'Kienyeji',
    count: 80,
    purpose: 'Eggs & Meat',
    healthStatus: 'attention',
    lastCheckup: 'Dec 28, 2025'
  },
  {
    id: 4,
    type: 'Sheep',
    breed: 'Dorper',
    count: 15,
    purpose: 'Meat',
    healthStatus: 'healthy',
    lastCheckup: 'Jan 12, 2026'
  },
  {
    id: 5,
    type: 'Pigs',
    breed: 'Large White',
    count: 12,
    purpose: 'Meat',
    healthStatus: 'healthy',
    lastCheckup: 'Jan 08, 2026'
  }
])
</script>