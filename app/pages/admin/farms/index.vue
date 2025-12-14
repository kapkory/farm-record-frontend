<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Farms Management</h1>
        <p class="text-gray-600 mt-2">Manage and monitor all registered farms</p>
      </div>
      <div class="mt-4 sm:mt-0">
        <NuxtLink 
          to="/admin/farms/add"
          class="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add New Farm
        </NuxtLink>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Farms</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalFarms }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Active Farms</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ activeFarms }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Area</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalArea }} <span class="text-sm text-gray-600">acres</span></p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Avg. Revenue</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">${{ avgRevenue.toLocaleString() }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <label class="text-sm font-medium text-gray-700 block mb-2">Search Farms</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input 
              v-model="searchQuery"
              type="search" 
              placeholder="Search by name, location, or owner..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-2">Status</label>
          <select 
            v-model="statusFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-2">Farm Type</label>
          <select 
            v-model="typeFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="">All Types</option>
            <option value="crop">Crop</option>
            <option value="livestock">Livestock</option>
            <option value="mixed">Mixed</option>
            <option value="organic">Organic</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Farms Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">All Farms ({{ filteredFarms.length }})</h2>
          <div class="flex items-center space-x-2">
            <button class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filter
            </button>
            <button class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <input type="checkbox" class="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500">
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Farm Name</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Area</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="farm in paginatedFarms" :key="farm.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500">
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ farm.name }}</div>
                    <div class="text-xs text-gray-500">ID: {{ farm.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ farm.owner }}</div>
                <div class="text-xs text-gray-500">{{ farm.contact }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ farm.location }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getTypeColor(farm.type)"
                >
                  {{ farm.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ farm.area }} acres</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusColor(farm.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusDot(farm.status)"></span>
                  {{ farm.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${{ farm.revenue.toLocaleString() }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click="viewFarm(farm.id)"
                    class="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button 
                    @click="editFarm(farm.id)"
                    class="text-green-600 hover:text-green-800"
                    title="Edit Farm"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button 
                    @click="deleteFarm(farm.id)"
                    class="text-red-600 hover:text-red-800"
                    title="Delete Farm"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing <span class="font-medium">{{ startIndex + 1 }}</span> to 
            <span class="font-medium">{{ Math.min(endIndex, filteredFarms.length) }}</span> of 
            <span class="font-medium">{{ filteredFarms.length }}</span> results
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="goToPage(page)"
              class="px-3 py-2 border rounded-lg text-sm font-medium"
              :class="currentPage === page ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              {{ page }}
            </button>
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Define layout
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})
const authStore = useAuthStore()

console.log("user is logged in right",authStore.isLoggedIn);
console.log("user info",authStore.user);

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const user = ref(null)

// Sample farms data
const farms = ref([
  { id: 'FM001', name: 'Sunrise Valley Farm', owner: 'John Smith', contact: 'john@email.com', location: 'Iowa, USA', type: 'Crop', area: 250, status: 'Active', revenue: 45600 },
  { id: 'FM002', name: 'Green Meadows', owner: 'Sarah Johnson', contact: 'sarah@email.com', location: 'Nebraska, USA', type: 'Livestock', area: 180, status: 'Active', revenue: 38900 },
  { id: 'FM003', name: 'Golden Harvest Co.', owner: 'Michael Brown', contact: 'michael@email.com', location: 'Kansas, USA', type: 'Mixed', area: 220, status: 'Active', revenue: 35200 },
  { id: 'FM004', name: 'Prairie Heights', owner: 'Emily Davis', contact: 'emily@email.com', location: 'Missouri, USA', type: 'Crop', area: 150, status: 'Inactive', revenue: 29800 },
  { id: 'FM005', name: 'Riverside Acres', owner: 'David Wilson', contact: 'david@email.com', location: 'Illinois, USA', type: 'Organic', area: 195, status: 'Active', revenue: 27500 },
  { id: 'FM006', name: 'Mountain View Ranch', owner: 'Lisa Anderson', contact: 'lisa@email.com', location: 'Colorado, USA', type: 'Livestock', area: 300, status: 'Active', revenue: 52100 },
  { id: 'FM007', name: 'Valley Springs Farm', owner: 'Robert Taylor', contact: 'robert@email.com', location: 'Texas, USA', type: 'Mixed', area: 275, status: 'Active', revenue: 48300 },
  { id: 'FM008', name: 'Hillside Organic', owner: 'Jennifer Lee', contact: 'jennifer@email.com', location: 'California, USA', type: 'Organic', area: 120, status: 'Pending', revenue: 31200 },
  { id: 'FM009', name: 'Lakeside Farms', owner: 'William Martinez', contact: 'william@email.com', location: 'Minnesota, USA', type: 'Crop', area: 210, status: 'Active', revenue: 42800 },
  { id: 'FM010', name: 'Sunset Ridge', owner: 'Amanda Garcia', contact: 'amanda@email.com', location: 'Oregon, USA', type: 'Mixed', area: 165, status: 'Active', revenue: 36700 },
  { id: 'FM011', name: 'Crystal Creek Farm', owner: 'James White', contact: 'james@email.com', location: 'Wisconsin, USA', type: 'Livestock', area: 190, status: 'Inactive', revenue: 28900 },
  { id: 'FM012', name: 'Autumn Fields', owner: 'Mary Thomas', contact: 'mary@email.com', location: 'Indiana, USA', type: 'Crop', area: 235, status: 'Active', revenue: 44100 }
])

// Computed statistics
const totalFarms = computed(() => farms.value.length)
const activeFarms = computed(() => farms.value.filter(f => f.status === 'Active').length)
const totalArea = computed(() => farms.value.reduce((sum, f) => sum + f.area, 0))
const avgRevenue = computed(() => Math.round(farms.value.reduce((sum, f) => sum + f.revenue, 0) / farms.value.length))

const { $apiFetch } = useNuxtApp()
onMounted(async () => {
  const response = await $apiFetch('/api/user');
  console.log('Fetched farms:', response);

})
// Filtered farms
const filteredFarms = computed(() => {
  return farms.value.filter(farm => {
    const matchesSearch = searchQuery.value === '' || 
      farm.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      farm.owner.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === '' || 
      farm.status.toLowerCase() === statusFilter.value.toLowerCase()
    
    const matchesType = typeFilter.value === '' || 
      farm.type.toLowerCase() === typeFilter.value.toLowerCase()
    
    return matchesSearch && matchesStatus && matchesType
  })
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredFarms.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)
const paginatedFarms = computed(() => filteredFarms.value.slice(startIndex.value, endIndex.value))

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Pagination methods
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

// Helper methods
const getStatusColor = (status) => {
  const colors = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Pending': 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusDot = (status) => {
  const colors = {
    'Active': 'bg-green-500',
    'Inactive': 'bg-gray-500',
    'Pending': 'bg-yellow-500'
  }
  return colors[status] || 'bg-gray-500'
}

const getTypeColor = (type) => {
  const colors = {
    'Crop': 'bg-blue-100 text-blue-800',
    'Livestock': 'bg-purple-100 text-purple-800',
    'Mixed': 'bg-pink-100 text-pink-800',
    'Organic': 'bg-green-100 text-green-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// Action methods
const viewFarm = (id) => {
  console.log('View farm:', id)
  // navigateTo(`/admin/farms/${id}`)
}

const editFarm = (id) => {
  console.log('Edit farm:', id)
  // navigateTo(`/admin/farms/${id}/edit`)
}

const deleteFarm = (id) => {
  if (confirm('Are you sure you want to delete this farm?')) {
    console.log('Delete farm:', id)
    // Handle delete logic
  }
}

// SEO Meta
useHead({
  title: 'Farms Management - FarmManage Pro Admin',
  meta: [
    { name: 'description', content: 'Manage and monitor all registered farms in the FarmManage Pro system.' }
  ]
})
</script>
