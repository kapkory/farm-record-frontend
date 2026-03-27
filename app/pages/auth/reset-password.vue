<template>
  <div class="min-h-screen farm-bg farm-pattern flex items-center justify-center p-4">
    <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
      <div class="space-y-8 text-center lg:text-left">
        <div class="flex items-center justify-center lg:justify-start space-x-3">
          <div class="w-12 h-12 bg-farm-green rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm0 0v3m-9 4h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2zm18 0V7a2 2 0 00-2-2h-3.5a1.5 1.5 0 01-1.2-.6l-.6-.8A2 2 0 0012.1 3H11.9a2 2 0 00-1.6.8l-.6.8A1.5 1.5 0 018.5 5H5a2 2 0 00-2 2v9"/>
              </svg>
            </div>
          </div>

          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Set Your New
            <span class="text-farm-green">Password</span>
          </h2>
          <p class="text-xl text-gray-600 leading-relaxed">
            Use the secure reset link from your email to choose a new password and sign back in.
          </p>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Password Tips:</h3>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <span class="text-gray-900 font-medium">Use at least 8 characters</span>
              <p class="text-sm text-gray-600">Longer passwords are harder to guess.</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <span class="text-gray-900 font-medium">Avoid reusing old passwords</span>
              <p class="text-sm text-gray-600">Pick something unique for this account.</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <span class="text-gray-900 font-medium">Store it somewhere safe</span>
              <p class="text-sm text-gray-600">A password manager works well for teams.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center lg:justify-end">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div v-if="success" class="text-center space-y-6">
            <div class="flex justify-center">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-farm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <div class="space-y-3">
              <h2 class="text-3xl font-bold text-gray-900">Password Updated</h2>
              <p class="text-gray-600">Your password has been reset successfully. You can now sign in with the new password.</p>
            </div>
            <NuxtLink
              to="/login"
              class="inline-flex items-center justify-center rounded-lg bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600"
            >
              Go to Login
            </NuxtLink>
          </div>

          <div v-else>
            <div class="text-center mb-8">
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p class="text-gray-600">Create a new password for your farm account</p>
            </div>

            <div v-if="!hasResetLink" class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Reset link is incomplete. Open the full link from your email, or request a new one from the forgot password page.
            </div>

            <form v-else @submit.prevent="handleSubmit" class="space-y-6">
              <div class="space-y-2">
                <label for="email" class="text-sm font-semibold text-gray-700 block">Email Address</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{ 'border-red-500': errors.email }"
                />
                <p v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</p>
              </div>

              <div class="space-y-2">
                <label for="password" class="text-sm font-semibold text-gray-700 block">New Password</label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{ 'border-red-500': errors.password }"
                />
                <p v-if="errors.password" class="text-sm text-red-500 mt-1">{{ errors.password }}</p>
              </div>

              <div class="space-y-2">
                <label for="password_confirmation" class="text-sm font-semibold text-gray-700 block">Confirm Password</label>
                <input
                  id="password_confirmation"
                  v-model="form.password_confirmation"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{ 'border-red-500': errors.password_confirmation }"
                />
                <p v-if="errors.password_confirmation" class="text-sm text-red-500 mt-1">{{ errors.password_confirmation }}</p>
              </div>

              <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ submitError }}
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="isLoading">Resetting Password...</span>
                <span v-else>Reset Password</span>
              </button>
            </form>

            <div class="pt-6 border-t border-gray-200 mt-6">
              <NuxtLink to="/login" class="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Login
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

type ResetErrors = {
  email: string
  password: string
  password_confirmation: string
}

const route = useRoute()

const queryValue = (value: string | string[] | undefined) => Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

const token = computed(() => queryValue(route.query.token))
const emailFromLink = computed(() => queryValue(route.query.email))
const hasResetLink = computed(() => Boolean(token.value && emailFromLink.value))

const form = ref({
  email: emailFromLink.value,
  password: '',
  password_confirmation: ''
})

const errors = ref<ResetErrors>({
  email: '',
  password: '',
  password_confirmation: ''
})

const isLoading = ref(false)
const submitError = ref('')
const success = ref(false)

watch(emailFromLink, (value) => {
  form.value.email = value
}, { immediate: true })

const validateForm = () => {
  errors.value = {
    email: '',
    password: '',
    password_confirmation: ''
  }

  let isValid = true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!form.value.email || !emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!form.value.password || form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters long'
    isValid = false
  }

  if (!form.value.password_confirmation) {
    errors.value.password_confirmation = 'Please confirm your password'
    isValid = false
  } else if (form.value.password !== form.value.password_confirmation) {
    errors.value.password_confirmation = 'Passwords do not match'
    isValid = false
  }

  if (!token.value) {
    submitError.value = 'Reset token is missing from the link.'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  submitError.value = ''

  if (!validateForm()) return

  isLoading.value = true

  try {
    const { resetPassword } = useAuth()
    await resetPassword({
      token: token.value,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    })
    success.value = true
  } catch (error: any) {
    const resData = error?.response?.data || error?.data
    submitError.value = resData?.message || 'Unable to reset password. Please try again.'

    if (resData?.errors?.email) errors.value.email = resData.errors.email[0]
    if (resData?.errors?.password) errors.value.password = resData.errors.password[0]
    if (resData?.errors?.password_confirmation) errors.value.password_confirmation = resData.errors.password_confirmation[0]
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Reset Password - FarmConsul',
  meta: [
    { name: 'description', content: 'Reset your FarmConsul account password using the secure link sent to your email.' }
  ]
})
</script>