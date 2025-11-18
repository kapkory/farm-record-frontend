<template>
  <div class="min-h-screen farm-bg farm-pattern flex items-center justify-center p-4">
    <!-- Main Container -->
    <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
      
      <!-- Left Side - Farm Information -->
      <div class="space-y-8 text-center lg:text-left">
        <!-- Logo -->
        <div class="flex items-center justify-center lg:justify-start space-x-3">
          <div class="w-12 h-12 bg-farm-green rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">FarmManage Pro</h1>
            <p class="text-sm text-gray-600">Smart Farm Management System</p>
          </div>
        </div>

        <!-- Welcome Message -->
        <div class="space-y-6">
          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Join Thousands of 
            <span class="text-farm-green">Smart Farmers</span>
          </h2>
          <p class="text-xl text-gray-600 leading-relaxed">
            Transform your farming operations with our comprehensive management system. 
            Track crops, manage livestock, monitor weather, and optimize yields all in one place.
          </p>
        </div>

        <!-- Features List -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">Crop planning and rotation management</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">Livestock tracking and health monitoring</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">Weather forecasts and alerts</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">Financial tracking and reporting</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 pt-8">
          <div class="text-center">
            <div class="text-2xl font-bold text-farm-green">10K+</div>
            <div class="text-sm text-gray-600">Active Farms</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-farm-green">2M+</div>
            <div class="text-sm text-gray-600">Acres Managed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-farm-green">98%</div>
            <div class="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      <!-- Right Side - Registration Form -->
      <div class="flex justify-center lg:justify-end">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <!-- Form Header -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p class="text-gray-600">Get started with FarmManage Pro</p>
          </div>
          
          <!-- Registration Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Full Name Field -->
            <div class="space-y-2">
              <label for="name" class="text-sm font-semibold text-gray-700 block">
                Full Name
              </label>
              <div class="relative">
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="John Doe"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{'border-red-500': errors.name}"
                />
                <div v-if="errors.name" class="absolute right-3 top-3">
                  <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
            </div>

            <!-- Email Address Field -->
            <div class="space-y-2">
              <label for="email" class="text-sm font-semibold text-gray-700 block">
                Email Address
              </label>
              <div class="relative">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="john.doe@email.com"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{'border-red-500': errors.email}"
                />
                <div v-if="errors.email" class="absolute right-3 top-3">
                  <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <p v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</p>
            </div>

            <!-- Phone Number Field -->
            <div class="space-y-2">
              <label for="phone" class="text-sm font-semibold text-gray-700 block">
                Phone Number
              </label>
              <div class="relative">
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{'border-red-500': errors.phone}"
                />
                <div v-if="errors.phone" class="absolute right-3 top-3">
                  <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <p v-if="errors.phone" class="text-sm text-red-500 mt-1">{{ errors.phone }}</p>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="text-sm font-semibold text-gray-700 block">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{'border-red-500': errors.password}"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="!showPassword" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="text-sm text-red-500 mt-1">{{ errors.password }}</p>
              <p class="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="isLoading">Creating Account...</span>
              <span v-else>Create Account</span>
            </button>
          </form>

          <!-- Login Link -->
          <div class="text-center mt-6">
            <p class="text-gray-600">
              Already have an account? 
              <NuxtLink to="/login" class="text-green-500 hover:text-green-600 font-semibold">
                Sign in here
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Use Pinia auth store
const authStore = useAuthStore()

// Form data
const form = ref({
  name: '',
  email: '',
  phone: '',
  password: ''
})

const errors = ref({
  name: '',
  email: '',
  phone: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)

// Get loading state from store
const isLoading = computed(() => authStore.authLoading || isSubmitting.value)

// Validation function
const validateForm = () => {
  let isValid = true
  errors.value = {
    name: '',
    email: '',
    phone: '',
    password: ''
  }

  // Name validation
  if (!form.value.name || form.value.name.length < 2) {
    errors.value.name = 'Please enter your full name'
    isValid = false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email || !emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  // Phone validation
  if (!form.value.phone || form.value.phone.length < 10) {
    errors.value.phone = 'Please enter a valid phone number'
    isValid = false
  }

  // Password validation
  if (!form.value.password || form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
    isValid = false
  }

  return isValid
}

// Form submission using Pinia store
const handleSubmit = async () => {
  // Prevent duplicate submissions at component level
  if (isSubmitting.value) {
    console.log('Form already submitting, ignoring duplicate submission')
    return
  }

  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Clear previous errors
    authStore.clearError()
    errors.value = { name: '', email: '', phone: '', password: '' }

    // Call Pinia store register action
    const result = await authStore.register({
    name: form.value.name,
    email: form.value.email,
    phone: form.value.phone,
      password: form.value.password
    })

    if (result.success) {
      // Redirect to admin dashboard on success
      await navigateTo('/admin')
    } else if (result.errors) {
      // Map validation errors to form fields
      if (result.errors.name) {
        errors.value.name = result.errors.name[0]
      }
      if (result.errors.email) {
        errors.value.email = result.errors.email[0]
      }
      if (result.errors.phone) {
        errors.value.phone = result.errors.phone[0]
      }
      if (result.errors.password) {
        errors.value.password = result.errors.password[0]
      }
    } else {
      // Generic error message
      errors.value.email = result.error || 'Registration failed. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Page metadata
definePageMeta({
  middleware: ['guest']
})

// SEO Meta
useHead({
  title: 'Register - FarmManage Pro',
  meta: [
    { name: 'description', content: 'Join FarmManage Pro and transform your farming operations with our comprehensive management system.' }
  ]
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>