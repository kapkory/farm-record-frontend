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
            Welcome Back to 
            <span class="text-farm-green">Your Farm</span>
          </h2>
          <p class="text-xl text-gray-600 leading-relaxed">
            Access your dashboard and continue managing your farming operations efficiently. 
            Track your progress and optimize your farm's productivity.
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
            <span class="text-gray-700">Real-time farm analytics</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">Secure data management</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">Mobile access anywhere</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">24/7 support access</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 pt-8">
          <div class="text-center">
            <div class="text-2xl font-bold text-farm-green">99.9%</div>
            <div class="text-sm text-gray-600">Uptime</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-farm-green">24/7</div>
            <div class="text-sm text-gray-600">Available</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-farm-green">Secure</div>
            <div class="text-sm text-gray-600">Encrypted</div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="flex justify-center lg:justify-end">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <!-- Form Header -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p class="text-gray-600">Sign in to your account</p>
          </div>
          
          <!-- Login Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
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

            <!-- Password Field -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="password" class="text-sm font-semibold text-gray-700 block">
                  Password
                </label>
                <NuxtLink to="/forgot-password" class="text-sm text-green-500 hover:text-green-600 font-medium">
                  Forgot password?
                </NuxtLink>
              </div>
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
            </div>

            <!-- Remember Me Checkbox -->
            <div class="flex items-center">
              <input
                id="remember"
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <label for="remember" class="ml-2 text-sm text-gray-700">
                Remember me for 30 days
              </label>
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
              <span v-if="isLoading">Signing In...</span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <!-- Social Login Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Facebook</span>
            </button>
          </div>

          <!-- Sign Up Link -->
          <div class="text-center mt-6">
            <p class="text-gray-600">
              Don't have an account? 
              <NuxtLink to="/register" class="text-green-500 hover:text-green-600 font-semibold">
                Sign up here
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
  email: '',
  password: '',
  rememberMe: false
})

const errors = ref({
  email: '',
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
    email: '',
    password: ''
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email || !emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  // Password validation
  if (!form.value.password || form.value.password.length < 1) {
    errors.value.password = 'Please enter your password'
    isValid = false
  }

  return isValid
}

// Form submission
const handleSubmit = async () => {
  // Prevent duplicate submissions at component level
  if (isSubmitting.value) {
    console.log('Form already submitting, ignoring duplicate submission')
    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    // Clear previous errors
    authStore.clearError()
    errors.value = { email: '', password: '' }

    // Call Pinia store login action
    const result = await authStore.login({
    email: form.value.email,
      password: form.value.password,
      remember: form.value.rememberMe
    })

    if (result.success) {
      // Redirect to dashboard on success
      await navigateTo('/admin')
    } else if (result.errors) {
      // Map validation errors to form fields
      if (result.errors.email) {
        errors.value.email = result.errors.email[0]
      }
      if (result.errors.password) {
        errors.value.password = result.errors.password[0]
      }
    } else {
      // Generic error message
      errors.value.password = result.error || 'Invalid email or password'
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
  title: 'Login - FarmManage Pro',
  meta: [
    { name: 'description', content: 'Sign in to your FarmManage Pro account and manage your farming operations efficiently.' }
  ]
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
