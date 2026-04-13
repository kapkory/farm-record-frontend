<template>
  <div class="min-h-screen farm-bg farm-pattern flex items-center justify-center p-4">
    <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

      <!-- Left Side - Information -->
      <div class="space-y-8 text-center lg:text-left">
        <div class="flex items-center justify-center lg:justify-start space-x-3">
          <div class="w-12 h-12 bg-farm-green rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">FarmConsul</h1>
            <p class="text-sm text-gray-600">Smart Farm Management System</p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="flex justify-center lg:justify-start">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-16 h-16 text-farm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
          </div>
          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Set a New
            <span class="text-farm-green">Password</span>
          </h2>
          <p class="text-xl text-gray-600 leading-relaxed">
            Choose a strong password for your account. Once changed you'll be redirected to sign in.
          </p>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Tips for a strong password:</h3>
          <div v-for="tip in passwordTips" :key="tip.text" class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">{{ tip.text }}</span>
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="flex justify-center lg:justify-end">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

          <!-- Success state -->
          <div v-if="success" class="text-center space-y-6">
            <div class="flex justify-center">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-farm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">Password Updated!</h2>
            <p class="text-gray-600">Your password has been reset successfully. You can now sign in with your new password.</p>
            <NuxtLink
              to="/login"
              class="block w-full py-3 px-4 bg-farm-green text-white rounded-lg font-semibold text-center hover:bg-green-600 transition-colors"
            >
              Sign In
            </NuxtLink>
          </div>

          <!-- Invalid / expired token -->
          <div v-else-if="tokenInvalid" class="text-center space-y-6">
            <div class="flex justify-center">
              <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">Link Expired</h2>
            <p class="text-gray-600">This password reset link is invalid or has expired. Please request a new one.</p>
            <NuxtLink
              to="/forgot-password"
              class="block w-full py-3 px-4 bg-farm-green text-white rounded-lg font-semibold text-center hover:bg-green-600 transition-colors"
            >
              Request New Link
            </NuxtLink>
          </div>

          <!-- Reset form -->
          <form v-else @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <h2 class="text-3xl font-bold text-gray-900">Reset Password</h2>
              <p class="text-gray-600 text-sm">Enter your new password below.</p>
            </div>

            <!-- Email (read-only, passed via query param) -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                :value="email"
                disabled
                class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <!-- New password -->
            <div class="space-y-1">
              <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter new password"
                  autocomplete="new-password"
                  class="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-farm-green focus:border-farm-green outline-none transition-colors"
                  :class="errors.password ? 'border-red-400' : 'border-gray-300'"
                />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>
            </div>

            <!-- Confirm password -->
            <div class="space-y-1">
              <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div class="relative">
                <input
                  id="password_confirmation"
                  v-model="form.password_confirmation"
                  :type="showConfirm ? 'text' : 'password'"
                  placeholder="Confirm new password"
                  autocomplete="new-password"
                  class="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-farm-green focus:border-farm-green outline-none transition-colors"
                  :class="errors.password_confirmation ? 'border-red-400' : 'border-gray-300'"
                />
                <button type="button" @click="showConfirm = !showConfirm"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <svg v-if="showConfirm" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <p v-if="errors.password_confirmation" class="text-sm text-red-500">{{ errors.password_confirmation }}</p>
            </div>

            <!-- General error -->
            <p v-if="errors.general" class="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{{ errors.general }}</p>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 bg-farm-green text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <span>{{ isLoading ? 'Resetting…' : 'Reset Password' }}</span>
            </button>

            <p class="text-center text-sm text-gray-600">
              Remember your password?
              <NuxtLink to="/login" class="text-farm-green font-medium hover:text-green-600">Sign in</NuxtLink>
            </p>
          </form>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const token = route.params.token as string
const email = (route.query.email as string) || ''

const form = ref({ password: '', password_confirmation: '' })
const errors = ref<{ password?: string; password_confirmation?: string; general?: string }>({})
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const success = ref(false)
const tokenInvalid = ref(false)

const passwordTips = [
  { text: 'At least 8 characters long' },
  { text: 'Mix of uppercase and lowercase letters' },
  { text: 'Include numbers and special characters' },
  { text: 'Avoid easily guessable words' },
]

function validate() {
  errors.value = {}
  if (!form.value.password) {
    errors.value.password = 'Password is required.'
    return false
  }
  if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters.'
    return false
  }
  if (form.value.password !== form.value.password_confirmation) {
    errors.value.password_confirmation = 'Passwords do not match.'
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  try {
    const { resetPassword } = useAuth()
    await resetPassword({
      token,
      email,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    })
    success.value = true
  } catch (err: any) {
    const data = err?.response?.data || err?.data
    if (data?.errors?.email) {
      // Laravel returns email errors when the token is invalid/expired
      tokenInvalid.value = true
    } else if (data?.errors?.password) {
      errors.value.password = data.errors.password[0]
    } else {
      errors.value.general = data?.message || 'Something went wrong. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Reset Password — FarmConsul',
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>
