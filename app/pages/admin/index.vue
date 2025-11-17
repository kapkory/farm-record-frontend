<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      <p class="text-gray-600 mt-2">Welcome back! Here's what's happening with your farms today.</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Farms -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Farms</p>
            <h3 class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalFarms }}</h3>
            <div class="flex items-center mt-2">
              <svg class="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm text-green-600 font-medium">+12%</span>
              <span class="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Active Crops -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Crops</p>
            <h3 class="text-3xl font-bold text-gray-900 mt-2">{{ stats.activeCrops }}</h3>
            <div class="flex items-center mt-2">
              <svg class="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm text-green-600 font-medium">+8%</span>
              <span class="text-sm text-gray-500 ml-1">vs last season</span>
            </div>
          </div>
          <div class="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Livestock -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Livestock</p>
            <h3 class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalLivestock }}</h3>
            <div class="flex items-center mt-2">
              <svg class="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm text-red-600 font-medium">-3%</span>
              <span class="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Revenue -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
            <h3 class="text-3xl font-bold text-gray-900 mt-2">${{ stats.revenue.toLocaleString() }}</h3>
            <div class="flex items-center mt-2">
              <svg class="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm text-green-600 font-medium">+23%</span>
              <span class="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Production Overview Chart -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Production Overview</h2>
          <select class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
        </div>
        
        <!-- Simple Bar Chart Representation -->
        <div class="space-y-4">
          <div v-for="(item, index) in productionData" :key="index" class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-gray-700">{{ item.label }}</span>
              <span class="text-gray-600">{{ item.value }} tons</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all duration-500"
                :class="item.color"
                :style="{ width: item.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
        
        <div class="space-y-6">
          <!-- Pending Tasks -->
          <div class="flex items-start">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ quickStats.pendingTasks }}</p>
              <p class="text-sm text-gray-600">Pending Tasks</p>
            </div>
          </div>

          <!-- Upcoming Harvests -->
          <div class="flex items-start">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ quickStats.upcomingHarvests }}</p>
              <p class="text-sm text-gray-600">Upcoming Harvests</p>
            </div>
          </div>

          <!-- Health Alerts -->
          <div class="flex items-start">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ quickStats.healthAlerts }}</p>
              <p class="text-sm text-gray-600">Health Alerts</p>
            </div>
          </div>

          <!-- Active Workers -->
          <div class="flex items-start">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ quickStats.activeWorkers }}</p>
              <p class="text-sm text-gray-600">Active Workers</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity and Top Farms -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Recent Activity</h2>
          <NuxtLink to="/admin/activity" class="text-sm text-green-500 hover:text-green-600 font-medium">
            View All
          </NuxtLink>
        </div>
        
        <div class="space-y-4">
          <div v-for="(activity, index) in recentActivity" :key="index" class="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="activity.iconBg"
            >
              <svg class="w-5 h-5" :class="activity.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="activity.iconPath"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
              <p class="text-sm text-gray-600">{{ activity.description }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performing Farms -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Top Performing Farms</h2>
          <NuxtLink to="/admin/farms" class="text-sm text-green-500 hover:text-green-600 font-medium">
            View All
          </NuxtLink>
        </div>
        
        <div class="space-y-4">
          <div v-for="(farm, index) in topFarms" :key="index" class="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span class="text-green-600 font-bold text-sm">#{{ index + 1 }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ farm.name }}</p>
                <p class="text-xs text-gray-600">{{ farm.location }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-green-600">${{ farm.revenue.toLocaleString() }}</p>
              <p class="text-xs text-gray-500">{{ farm.area }} acres</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Define layout
definePageMeta({
  layout: 'admin'
})

// Statistics data
const stats = ref({
  totalFarms: 127,
  activeCrops: 45,
  totalLivestock: 3842,
  revenue: 254750
})

// Production data for chart
const productionData = ref([
  { label: 'Wheat', value: 450, percentage: 90, color: 'bg-green-500' },
  { label: 'Corn', value: 380, percentage: 76, color: 'bg-yellow-500' },
  { label: 'Soybeans', value: 320, percentage: 64, color: 'bg-blue-500' },
  { label: 'Rice', value: 280, percentage: 56, color: 'bg-purple-500' },
  { label: 'Cotton', value: 210, percentage: 42, color: 'bg-pink-500' }
])

// Quick stats
const quickStats = ref({
  pendingTasks: 24,
  upcomingHarvests: 8,
  healthAlerts: 3,
  activeWorkers: 156
})

// Recent activity
const recentActivity = ref([
  {
    title: 'New farm added',
    description: 'Green Valley Farm was successfully registered',
    time: '2 hours ago',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    iconPath: 'M12 4v16m8-8H4'
  },
  {
    title: 'Harvest completed',
    description: 'Corn harvest at Sunrise Farm completed successfully',
    time: '5 hours ago',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Health alert',
    description: 'Livestock health check required at Meadow Farm',
    time: '8 hours ago',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  },
  {
    title: 'New user registered',
    description: 'Sarah Johnson joined as Farm Manager',
    time: '1 day ago',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  }
])

// Top performing farms
const topFarms = ref([
  { name: 'Sunrise Valley Farm', location: 'Iowa', revenue: 45600, area: 250 },
  { name: 'Green Meadows', location: 'Nebraska', revenue: 38900, area: 180 },
  { name: 'Golden Harvest Co.', location: 'Kansas', revenue: 35200, area: 220 },
  { name: 'Prairie Heights', location: 'Missouri', revenue: 29800, area: 150 },
  { name: 'Riverside Acres', location: 'Illinois', revenue: 27500, area: 195 }
])

// SEO Meta
useHead({
  title: 'Dashboard - FarmManage Pro Admin',
  meta: [
    { name: 'description', content: 'Admin dashboard for FarmManage Pro farm management system.' }
  ]
})
</script>
