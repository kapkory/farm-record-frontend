<template>
  <div class="min-h-screen farm-bg farm-pattern">
    <!-- Navigation -->
    <nav class="bg-white/95 backdrop-blur border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">FarmManage Pro</h1>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/login" class="text-gray-600 hover:text-gray-900 font-medium">
              Login
            </NuxtLink>
            <NuxtLink 
              to="/register" 
              class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-medium"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <h1 class="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Smart Farm Management
          <span class="block text-green-500">Made Simple</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform your farming operations with our comprehensive management system. 
          Track crops, manage livestock, monitor weather, and optimize yields all in one place.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/register" 
            class="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 font-semibold text-lg"
          >
            Start Free Trial
          </NuxtLink>
          <button class="border-2 border-green-500 text-green-500 px-8 py-4 rounded-lg hover:bg-green-50 font-semibold text-lg">
            Watch Demo
          </button>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Crop Management</h3>
          <p class="text-gray-600">Plan crop rotations, track planting schedules, and monitor growth stages with precision.</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
          <p class="text-gray-600">Get detailed insights into farm performance with comprehensive analytics and reporting tools.</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Weather Monitoring</h3>
          <p class="text-gray-600">Stay informed with real-time weather data and forecasts tailored to your farm's location.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO Meta
useHead({
  title: 'FarmConsul - Smart Farm Management System',
  meta: [
    { name: 'description', content: 'Transform your farming operations with FarmConsul. Comprehensive farm management software for modern farmers.' }
  ]
})
</script>