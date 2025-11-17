<template>
  <nav class="bg-[#2E3B6F] border-b border-[#3d4b7a] fixed top-0 left-0 right-0 z-50">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left Side - Logo and Navigation -->
        <div class="flex items-center space-x-8">
          <!-- Logo -->
          <NuxtLink to="/admin" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-[#2E3B6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <span class="text-white font-bold text-xl">dashlite</span>
          </NuxtLink>

          <!-- Navigation Menu -->
          <div class="hidden lg:flex items-center space-x-1">
            <!-- Dashboards Dropdown -->
            <div class="relative">
              <button 
                @click="toggleDropdown('dashboards')"
                class="flex items-center px-4 py-2 text-white hover:bg-[#3d4b7a] rounded-md transition-colors text-sm font-medium"
                :class="{'bg-[#3d4b7a]': openDropdown === 'dashboards'}"
              >
                Dashboards
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div 
                v-show="openDropdown === 'dashboards'"
                class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <NuxtLink 
                  to="/admin"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Main Dashboard
                </NuxtLink>
                <NuxtLink 
                  to="/admin/analytics"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Analytics
                </NuxtLink>
              </div>
            </div>

            <!-- Applications Dropdown -->
            <div class="relative">
              <button 
                @click="toggleDropdown('applications')"
                class="flex items-center px-4 py-2 text-white hover:bg-[#3d4b7a] rounded-md transition-colors text-sm font-medium"
                :class="{'bg-[#3d4b7a]': openDropdown === 'applications'}"
              >
                Applications
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div 
                v-show="openDropdown === 'applications'"
                class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <NuxtLink 
                  to="/admin/farms"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Farms
                </NuxtLink>
                <NuxtLink 
                  to="/admin/crops"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Crops
                </NuxtLink>
                <NuxtLink 
                  to="/admin/livestock"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Livestock
                </NuxtLink>
                <NuxtLink 
                  to="/admin/inventory"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Inventory
                </NuxtLink>
              </div>
            </div>

            <!-- Pages Dropdown -->
            <div class="relative">
              <button 
                @click="toggleDropdown('pages')"
                class="flex items-center px-4 py-2 text-white hover:bg-[#3d4b7a] rounded-md transition-colors text-sm font-medium"
                :class="{'bg-[#3d4b7a]': openDropdown === 'pages'}"
              >
                Pages
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div 
                v-show="openDropdown === 'pages'"
                class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <NuxtLink 
                  to="/admin/users"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Users
                </NuxtLink>
                <NuxtLink 
                  to="/admin/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Profile
                </NuxtLink>
                <NuxtLink 
                  to="/admin/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Settings
                </NuxtLink>
              </div>
            </div>

            <!-- Misc Dropdown -->
            <div class="relative">
              <button 
                @click="toggleDropdown('misc')"
                class="flex items-center px-4 py-2 text-white hover:bg-[#3d4b7a] rounded-md transition-colors text-sm font-medium"
                :class="{'bg-[#3d4b7a]': openDropdown === 'misc'}"
              >
                Misc
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div 
                v-show="openDropdown === 'misc'"
                class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <NuxtLink 
                  to="/admin/reports/production"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Reports
                </NuxtLink>
                <NuxtLink 
                  to="/admin/help"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Help Center
                </NuxtLink>
                <NuxtLink 
                  to="/admin/documentation"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  @click="closeDropdowns"
                >
                  Documentation
                </NuxtLink>
              </div>
            </div>

            <!-- Components Dropdown -->
            <div class="relative">
              <button 
                @click="toggleDropdown('components')"
                class="flex items-center px-4 py-2 text-white hover:bg-[#3d4b7a] rounded-md transition-colors text-sm font-medium"
                :class="{'bg-[#3d4b7a]': openDropdown === 'components'}"
              >
                Components
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div 
                v-show="openDropdown === 'components'"
                class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors">
                  UI Elements
                </a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors">
                  Forms
                </a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors">
                  Charts
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - User Actions -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button class="relative text-white hover:bg-[#3d4b7a] p-2 rounded-md transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- User Profile Dropdown -->
          <div class="relative">
            <button 
              @click="toggleDropdown('user')"
              class="flex items-center space-x-3 hover:bg-[#3d4b7a] p-2 rounded-md transition-colors"
            >
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span class="text-white font-semibold text-sm">{{ userInitials }}</span>
              </div>
              <div class="hidden sm:block text-left">
                <p class="text-white text-sm font-medium">Administrator</p>
                <p class="text-gray-300 text-xs">Abu Bin Ishityak</p>
              </div>
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div 
              v-show="openDropdown === 'user'"
              class="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-200">
                <p class="text-sm font-semibold text-gray-900">Administrator</p>
                <p class="text-xs text-gray-600">admin@farmmanage.com</p>
              </div>
              <NuxtLink 
                to="/admin/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                @click="closeDropdowns"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                View Profile
              </NuxtLink>
              <NuxtLink 
                to="/admin/account"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                @click="closeDropdowns"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Account Settings
              </NuxtLink>
              <div class="border-t border-gray-200 my-2"></div>
              <button 
                @click="logout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          <!-- Language Selector -->
          <button class="flex items-center space-x-2 hover:bg-[#3d4b7a] p-2 rounded-md transition-colors">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'%3E%3Crect width='60' height='30' fill='%23012169'/%3E%3Cpath d='M0 0l60 30M60 0L0 30' stroke='%23fff' stroke-width='6'/%3E%3Cpath d='M0 0l60 30M60 0L0 30' stroke='%23C8102E' stroke-width='4' clip-path='inset(0)'/%3E%3Cpath d='M30 0v30M0 15h60' stroke='%23fff' stroke-width='10'/%3E%3Cpath d='M30 0v30M0 15h60' stroke='%23C8102E' stroke-width='6'/%3E%3C/svg%3E" alt="US Flag" class="w-6 h-4 rounded">
          </button>

          <!-- Mobile Menu Button -->
          <button 
            @click="$emit('toggle-mobile-menu')"
            class="lg:hidden text-white hover:bg-[#3d4b7a] p-2 rounded-md transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Dropdown Overlay -->
    <div 
      v-show="openDropdown"
      @click="closeDropdowns"
      class="fixed inset-0 z-40 bg-transparent"
    ></div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const openDropdown = ref(null)
const userInitials = ref('AB')

const toggleDropdown = (dropdown) => {
  if (openDropdown.value === dropdown) {
    openDropdown.value = null
  } else {
    openDropdown.value = dropdown
  }
}

const closeDropdowns = () => {
  openDropdown.value = null
}

const logout = () => {
  console.log('Logging out...')
  // navigateTo('/login')
}

defineEmits(['toggle-mobile-menu'])
</script>
