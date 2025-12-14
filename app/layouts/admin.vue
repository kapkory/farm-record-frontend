<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Offline Indicator -->
    <OfflineIndicator />
    
    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <!-- Tractor Icon -->
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">FarmManage</h1>
            <p class="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
        <button 
          @click="sidebarOpen = false"
          class="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto h-full">
        <!-- Dashboard -->
        <NuxtLink 
          to="/admin"
          class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
          :class="{'bg-green-50 text-green-600': $route.path === '/admin'}"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="font-medium">Dashboard</span>
        </NuxtLink>

        <!-- Farms with Dropdown -->
        <div>
          <button 
            @click="toggleDropdown('farms')"
            class="w-full flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            :class="{'bg-green-50 text-green-600': $route.path.startsWith('/admin/farms')}"
          >
            <div class="flex items-center">
              <!-- Barn/Farm Icon -->
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span class="font-medium">Farms</span>
            </div>
            <svg 
              class="w-4 h-4 transition-transform duration-200"
              :class="{'rotate-180': openDropdowns.farms}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div 
            v-show="openDropdowns.farms"
            class="ml-4 mt-1 space-y-1"
          >
            <NuxtLink 
              to="/admin/farms"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
              :class="{'bg-green-50 text-green-600': $route.path === '/admin/farms'}"
            >
              All Farms
            </NuxtLink>
            <NuxtLink 
              to="/admin/farms/add"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
              :class="{'bg-green-50 text-green-600': $route.path === '/admin/farms/add'}"
            >
              Add New Farm
            </NuxtLink>
            <NuxtLink 
              to="/admin/farms/map"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
              :class="{'bg-green-50 text-green-600': $route.path === '/admin/farms/map'}"
            >
              Farm Locations
            </NuxtLink>
          </div>
        </div>

        <!-- Crops with Dropdown -->
        <div>
          <button 
            @click="toggleDropdown('crops')"
            class="w-full flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            :class="{'bg-green-50 text-green-600': $route.path.startsWith('/admin/crops')}"
          >
            <div class="flex items-center">
              <!-- Seedling/Plant Growing Icon -->
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
              </svg>
              <span class="font-medium">Crops</span>
            </div>
            <svg 
              class="w-4 h-4 transition-transform duration-200"
              :class="{'rotate-180': openDropdowns.crops}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div 
            v-show="openDropdowns.crops"
            class="ml-4 mt-1 space-y-1"
          >
            <NuxtLink 
              to="/admin/crops"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              All Crops
            </NuxtLink>
            <NuxtLink 
              to="/admin/crops/planting"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Planting Schedule
            </NuxtLink>
            <NuxtLink 
              to="/admin/crops/harvest"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Harvest Records
            </NuxtLink>
          </div>
        </div>

        <!-- Livestock with Dropdown -->
        <div>
          <button 
            @click="toggleDropdown('livestock')"
            class="w-full flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            :class="{'bg-green-50 text-green-600': $route.path.startsWith('/admin/livestock')}"
          >
            <div class="flex items-center">
              <!-- Animal Paw Icon -->
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.5 12c1.38 0 2.5-1.12 2.5-2.5S9.88 7 8.5 7 6 8.12 6 9.5 7.12 12 8.5 12zm7 0c1.38 0 2.5-1.12 2.5-2.5S16.88 7 15.5 7 13 8.12 13 9.5s1.12 2.5 2.5 2.5zM6 16.5c0-1.38-1.12-2.5-2.5-2.5S1 15.12 1 16.5 2.12 19 3.5 19 6 17.88 6 16.5zm14.5-2.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zM12 13c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
              </svg>
              <span class="font-medium">Livestock</span>
            </div>
            <svg 
              class="w-4 h-4 transition-transform duration-200"
              :class="{'rotate-180': openDropdowns.livestock}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div 
            v-show="openDropdowns.livestock"
            class="ml-4 mt-1 space-y-1"
          >
            <NuxtLink 
              to="/admin/livestock"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              All Livestock
            </NuxtLink>
            <NuxtLink 
              to="/admin/livestock/health"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Health Records
            </NuxtLink>
            <NuxtLink 
              to="/admin/livestock/breeding"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Breeding Program
            </NuxtLink>
          </div>
        </div>

        <!-- Inventory -->
        <NuxtLink 
          to="/admin/inventory"
          class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <span class="font-medium">Inventory</span>
        </NuxtLink>

        <!-- Reports with Dropdown -->
        <div>
          <button 
            @click="toggleDropdown('reports')"
            class="w-full flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            :class="{'bg-green-50 text-green-600': $route.path.startsWith('/admin/reports')}"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="font-medium">Reports</span>
            </div>
            <svg 
              class="w-4 h-4 transition-transform duration-200"
              :class="{'rotate-180': openDropdowns.reports}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div 
            v-show="openDropdowns.reports"
            class="ml-4 mt-1 space-y-1"
          >
            <NuxtLink 
              to="/admin/reports/production"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Production Reports
            </NuxtLink>
            <NuxtLink 
              to="/admin/reports/financial"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Financial Reports
            </NuxtLink>
            <NuxtLink 
              to="/admin/reports/custom"
              class="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Custom Reports
            </NuxtLink>
          </div>
        </div>

        <!-- Users -->
        <NuxtLink 
          to="/admin/users"
          class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <span class="font-medium">Users</span>
        </NuxtLink>

        <!-- Settings -->
        <NuxtLink 
          to="/admin/settings"
          class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span class="font-medium">Settings</span>
        </NuxtLink>
      </nav>
    </aside>

  <!-- Main Content -->
  <div class="lg:pl-64 flex flex-col flex-1 min-h-0">
      <!-- Notification Bar -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <!-- Left: Mobile menu toggle + Breadcrumb -->
          <div class="flex items-center space-x-3">
            <button
              @click="sidebarOpen = !sidebarOpen"
              aria-label="Toggle navigation"
              class="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <nav class="flex items-center text-sm text-gray-700">
              <NuxtLink to="/admin" class="text-gray-500 hover:text-gray-700 font-medium">
                Admin
              </NuxtLink>
              <svg class="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="font-semibold text-gray-900">{{ breadcrumb }}</span>
            </nav>
          </div>

          <!-- Right: Notifications & User -->
          <div class="flex items-center space-x-2">
            <!-- Notifications -->
            <div class="relative">
              <button
                @click="showNotifications = !showNotifications; showUserMenu = false"
                class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
                aria-label="Notifications"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                  {{ unreadCount }}
                </span>
              </button>

              <!-- Notifications Dropdown -->
              <div
                v-show="showNotifications"
                class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <div class="px-4 py-2 border-b border-gray-200">
                  <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div class="max-h-96 overflow-y-auto">
                  <div
                    v-for="notification in recentNotifications"
                    :key="notification.id"
                    class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div class="flex items-start space-x-3">
                      <div :class="[
                        'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                        notification.read ? 'bg-gray-300' : 'bg-green-500'
                      ]"></div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                        <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="px-4 py-2 border-t border-gray-200">
                  <button class="text-sm text-green-600 hover:text-green-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            </div>

            <!-- User Menu -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu; showNotifications = false"
                class="flex items-center space-x-2 p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
                aria-label="User menu"
              >
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-semibold text-sm">{{ userInitials }}</span>
                </div>
                <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- User Dropdown -->
              <div
                v-show="showUserMenu"
                class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <div class="px-4 py-3 border-b border-gray-200">
                  <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
                  <p class="text-xs text-gray-600">{{ userEmail }}</p>
                </div>
                <NuxtLink 
                  to="/admin/profile"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="showUserMenu = false"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  View Profile
                </NuxtLink>
                <NuxtLink 
                  to="/admin/settings"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="showUserMenu = false"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Settings
                </NuxtLink>
                <div class="border-t border-gray-200 my-2"></div>
                <button 
                  @click="handleLogout"
                  class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-0">
        <slot />
      </main>

      <!-- Footer -->
      <AdminFooter />
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-show="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Use Pinia auth store
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)

const openDropdowns = ref({
  farms: false,
  crops: false,
  livestock: false,
  reports: false
})

const toggleDropdown = (menu) => {
  openDropdowns.value[menu] = !openDropdowns.value[menu]
}

// User info from auth store
const userName = computed(() => authStore.currentFarmer?.name || 'User')
const userEmail = computed(() => authStore.currentFarmer?.email || 'user@farmmanage.com')
const userInitials = computed(() => {
  const name = userName.value
  const names = name.split(' ')
  if (names.length >= 2) {
    return names[0][0] + names[1][0]
  }
  return names[0][0] + (names[0][1] || '')
})

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
}

// Breadcrumb computed from current route path
const route = useRoute()
const capitalize = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const breadcrumb = computed(() => {
  const path = route.path || ''
  const cleaned = path.replace(/^\//, '').replace(/\/$/, '')
  const parts = cleaned.split('/')
  if (!parts.length || parts[0] !== 'admin') return 'Dashboard'
  const rest = parts.slice(1)
  if (rest.length === 0) return 'Dashboard'
  // show last segment, but make it readable
  const last = rest[rest.length - 1]
  return capitalize(last || rest.join(' / '))
})

// Sample notifications (last 5)
const recentNotifications = ref([
  {
    id: 1,
    title: 'New Farm Added',
    message: 'Green Valley Farm has been successfully added to the system',
    time: '2 minutes ago',
    read: false
  },
  {
    id: 2,
    title: 'Harvest Complete',
    message: 'Wheat harvest completed at Sunny Acres Farm',
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    title: 'Low Inventory Alert',
    message: 'Fertilizer stock is running low at 3 farms',
    time: '3 hours ago',
    read: true
  },
  {
    id: 4,
    title: 'Weather Alert',
    message: 'Heavy rain expected in the next 48 hours',
    time: '5 hours ago',
    read: true
  },
  {
    id: 5,
    title: 'New User Registered',
    message: 'John Doe has registered as a new farm manager',
    time: '1 day ago',
    read: true
  }
])

const unreadCount = computed(() => {
  return recentNotifications.value.filter(n => !n.read).length
})

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  const isClickInside = event.target.closest('.relative')
  if (!isClickInside) {
    showNotifications.value = false
    showUserMenu.value = false
  }
}

// Add event listener on mount
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<style scoped>
/* Custom scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: #f1f1f1;
}

nav::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
