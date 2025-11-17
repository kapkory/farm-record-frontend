<template>
  <div class="min-h-screen farm-bg farm-pattern flex items-center justify-center p-4">
    <!-- Main Container -->
    <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
      
      <!-- Left Side - Information -->
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

        <!-- Illustration/Message -->
        <div class="space-y-6">
          <div class="flex justify-center lg:justify-start">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-16 h-16 text-farm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>

          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Reset Your
            <span class="text-farm-green">Password</span>
          </h2>
          <p class="text-xl text-gray-600 leading-relaxed">
            Don't worry! It happens to the best of us. Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <!-- Security Features -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Security Features:</h3>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <span class="text-gray-900 font-medium">Secure Reset Link</span>
              <p class="text-sm text-gray-600">One-time use link expires in 1 hour</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <span class="text-gray-900 font-medium">Email Verification</span>
              <p class="text-sm text-gray-600">Link sent only to your registered email</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <span class="text-gray-900 font-medium">Encrypted Communication</span>
              <p class="text-sm text-gray-600">All data transmitted securely</p>
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div class="bg-green-50 rounded-lg p-6 space-y-2">
          <h3 class="font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 text-farm-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Need Additional Help?
          </h3>
          <p class="text-sm text-gray-600">
            If you don't receive the email within a few minutes, check your spam folder or contact our support team at 
            <a href="mailto:support@farmmanage.com" class="text-farm-green hover:text-green-600 font-medium">
              support@farmmanage.com
            </a>
          </p>
        </div>
      </div>

      <!-- Right Side - Reset Form -->
      <div class="flex justify-center lg:justify-end">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          
          <!-- Success State -->
          <div v-if="emailSent" class="text-center space-y-6">
            <div class="flex justify-center">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-farm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>

            <div class="space-y-3">
              <h2 class="text-3xl font-bold text-gray-900">Check Your Email</h2>
              <p class="text-gray-600">
                We've sent a password reset link to
              </p>
              <p class="font-semibold text-gray-900">{{ form.email }}</p>
              <p class="text-sm text-gray-600">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>

            <div class="pt-4 space-y-3">
              <p class="text-sm text-gray-600">
                Didn't receive the email?
              </p>
              <button
                @click="resendEmail"
                :disabled="resendCooldown > 0"
                class="text-green-500 hover:text-green-600 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email' }}
              </button>
            </div>

            <div class="pt-6 border-t border-gray-200">
              <NuxtLink 
                to="/login" 
                class="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Login
              </NuxtLink>
            </div>
          </div>

          <!-- Form State -->
          <div v-else>
            <!-- Form Header -->
            <div class="text-center mb-8">
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
              <p class="text-gray-600">Enter your email to reset your password</p>
            </div>
            
            <!-- Reset Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Email Address Field -->
              <div class="space-y-2">
                <label for="email" class="text-sm font-semibold text-gray-700 block">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-3 pointer-events-none">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                    </svg>
                  </div>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="john.doe@email.com"
                    required
                    class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
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
                <span v-if="isLoading">Sending Reset Link...</span>
                <span v-else>Send Reset Link</span>
              </button>
            </form>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <!-- Navigation Links -->
            <div class="space-y-3">
              <NuxtLink 
                to="/login" 
                class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Login
              </NuxtLink>

              <div class="text-center pt-2">
                <p class="text-gray-600 text-sm">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

// Form data
const form = ref({
  email: ''
})

const errors = ref({
  email: ''
})

const isLoading = ref(false)
const emailSent = ref(false)
const resendCooldown = ref(0)

let cooldownTimer = null

// Validation function
const validateForm = () => {
  let isValid = true
  errors.value = {
    email: ''
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email || !emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  return isValid
}

// Start cooldown timer
const startCooldown = () => {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer)
    }
  }, 1000)
}

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    const { forgotPassword } = useAuth()
    await forgotPassword({ email: form.value.email })
    emailSent.value = true
    startCooldown()
  } catch (error) {
    console.error('Password reset error:', error)
    const resData = error?.response?.data || error?.data
    if (resData?.errors?.email) errors.value.email = resData.errors.email[0]
    else errors.value.email = 'Unable to send reset email. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Resend email
const resendEmail = async () => {
  if (resendCooldown.value > 0) return
  
  isLoading.value = true
  
  try {
    console.log('Resending password reset email to:', form.value.email)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    startCooldown()
    
  } catch (error) {
    console.error('Resend error:', error)
  } finally {
    isLoading.value = false
  }
}

// Cleanup
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})

// SEO Meta
useHead({
  title: 'Forgot Password - FarmManage Pro',
  meta: [
    { name: 'description', content: 'Reset your FarmManage Pro password. Enter your email to receive a password reset link.' }
  ]
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
