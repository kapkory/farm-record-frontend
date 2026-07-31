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
            <h1 class="text-2xl font-bold text-gray-900">FarmConsul</h1>
            <p class="text-sm text-gray-600">Smart Farm Management System</p>
          </div>
        </div>

        <!-- Welcome Message -->
        <div class="space-y-4">
          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Join Thousands of
            <span class="text-farm-green">Smart Farmers</span>
          </h2>
          <p class="text-xl text-gray-600 leading-relaxed">
            Track crops, livestock, sales and money from your phone — even offline in the field.
          </p>
        </div>

        <!-- Features List -->
        <div class="space-y-4">
          <div v-for="feature in marketingFeatures" :key="feature" class="flex items-center space-x-3 justify-center lg:justify-start">
            <div class="w-6 h-6 bg-farm-green rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-gray-700">{{ feature }}</span>
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
          <h2 class="text-xl font-bold text-gray-900">Create your account</h2>

          <!-- Plan picker — name and price only; details live on /plans -->
          <div class="mt-3">
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="plan in plans"
                :key="plan.slug"
                type="button"
                class="rounded-lg border-2 px-2 py-2 text-center transition-all"
                :class="form.plan_slug === plan.slug ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'"
                @click="form.plan_slug = plan.slug"
              >
                <span class="block text-sm font-semibold" :class="form.plan_slug === plan.slug ? 'text-green-700' : 'text-gray-700'">{{ plan.name }}</span>
                <span class="block text-xs text-gray-500">KES {{ Number(plan.price).toLocaleString('en-KE') }}/{{ plan.interval === 'yearly' ? 'yr' : 'mo' }}</span>
              </button>
            </div>
            <p class="mt-1.5 text-xs text-gray-500">
              {{ selectedPlan?.trial_days ?? 14 }}-day free trial · no payment today ·
              <NuxtLink to="/plans" class="font-medium text-green-600 hover:text-green-700">compare plans</NuxtLink>
            </p>
            <p v-if="errors.plan_uuid" class="text-xs text-red-500 mt-1">{{ errors.plan_uuid }}</p>
          </div>

          <!-- Registration Form -->
          <form @submit.prevent="handleSubmit" class="mt-4 space-y-3.5">
            <div>
              <label for="name" class="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
              <input
                id="name" v-model="form.name" type="text" placeholder="Jane Wanjiku" required
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                :class="{'border-red-500': errors.name}"
              />
              <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
            </div>

            <div>
              <label for="email" class="text-sm font-semibold text-gray-700 block mb-1">Email Address</label>
              <input
                id="email" v-model="form.email" type="email" placeholder="jane@example.com" required
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                :class="{'border-red-500': errors.email}"
              />
              <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
            </div>

            <div>
              <label for="phone" class="text-sm font-semibold text-gray-700 block mb-1">Phone Number</label>
              <input
                id="phone" v-model="form.phone" type="tel" placeholder="0712 345 678" required
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                :class="{'border-red-500': errors.phone}"
              />
              <p v-if="errors.phone" class="text-xs text-red-500 mt-1">{{ errors.phone }}</p>
            </div>

            <div>
              <label for="farm_name" class="text-sm font-semibold text-gray-700 block mb-1">Farm Name</label>
              <input
                id="farm_name" v-model="form.farm_name" type="text" placeholder="Green Valley Farm" required
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                :class="{'border-red-500': errors.farm_name}"
              />
              <p v-if="errors.farm_name" class="text-xs text-red-500 mt-1">{{ errors.farm_name }}</p>
            </div>

            <div>
              <span class="text-sm font-semibold text-gray-700 block mb-1">Who runs the farm?</span>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="option in farmTypes"
                  :key="option.value"
                  type="button"
                  class="rounded-lg border-2 px-2 py-2 text-center text-sm font-medium transition-all"
                  :class="form.farm_type === option.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'"
                  @click="form.farm_type = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
              <p v-if="errors.farm_type" class="text-xs text-red-500 mt-1">{{ errors.farm_type }}</p>
            </div>

            <div>
              <label for="password" class="text-sm font-semibold text-gray-700 block mb-1">Password</label>
              <div class="relative">
                <input
                  id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="8+ characters" required
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{'border-red-500': errors.password}"
                />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password }}</p>
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
              <span v-if="isLoading">Creating your account…</span>
              <span v-else>Start my free trial</span>
            </button>
          </form>

          <!-- Login Link -->
          <div class="text-center mt-5">
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
import { ref, computed, onMounted } from 'vue'

const authStore = useAuthStore()
const route = useRoute()
const { plans, fetchPublicPlans } = usePublicPlans()

const marketingFeatures = [
  'Crop planning and rotation management',
  'Livestock tracking and health monitoring',
  'Sales, costs and profit per animal',
  'Works offline in the field',
]

const farmTypes = [
  { value: 'individual', label: 'Just me' },
  { value: 'group', label: 'A group' },
  { value: 'organization', label: 'Organization' },
]

// Selection is tracked by slug so the static fallback catalogue (which has
// no uuids yet) still resolves; the uuid is looked up at submit time.
const form = ref({
  plan_slug: 'professional',
  name: '',
  email: '',
  phone: '',
  farm_name: '',
  farm_type: 'individual',
  password: ''
})

const emptyErrors = () => ({
  plan_uuid: '',
  name: '',
  email: '',
  phone: '',
  farm_name: '',
  farm_type: '',
  password: ''
})

const errors = ref(emptyErrors())
const showPassword = ref(false)
const isSubmitting = ref(false)

const isLoading = computed(() => authStore.authLoading || isSubmitting.value)
const selectedPlan = computed(() => plans.value.find(p => p.slug === form.value.plan_slug))

onMounted(async () => {
  // Read ?plan= on the client only — the page is prerendered without a query.
  const requested = String(route.query.plan ?? '')
  if (requested) form.value.plan_slug = requested

  await fetchPublicPlans()

  if (!plans.value.some(p => p.slug === form.value.plan_slug)) {
    form.value.plan_slug = plans.value.find(p => p.slug === 'professional')?.slug ?? plans.value[0]?.slug ?? ''
  }
})

const validateForm = () => {
  let isValid = true
  errors.value = emptyErrors()

  if (!form.value.plan_slug) {
    errors.value.plan_uuid = 'Please choose a plan to continue'
    isValid = false
  }

  if (!form.value.name || form.value.name.length < 2) {
    errors.value.name = 'Please enter your full name'
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email || !emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!form.value.phone || form.value.phone.length < 10) {
    errors.value.phone = 'Please enter a valid phone number'
    isValid = false
  }

  if (!form.value.farm_name || form.value.farm_name.length < 2) {
    errors.value.farm_name = 'Please enter a farm name'
    isValid = false
  }

  if (!form.value.farm_type) {
    errors.value.farm_type = 'Please choose who runs the farm'
    isValid = false
  }

  if (!form.value.password || form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    authStore.clearError()
    errors.value = emptyErrors()

    const result = await authStore.register({
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      farm_name: form.value.farm_name,
      farm_type: form.value.farm_type,
      password: form.value.password,
      // Fallback plans carry no uuid — those register plan-less and the
      // farmer picks a plan later from the billing page.
      plan_uuid: selectedPlan.value?.uuid || undefined
    })

    if (result.success) {
      await navigateTo('/admin')
    } else if (result.errors) {
      for (const key of Object.keys(errors.value)) {
        if (result.errors[key]) errors.value[key] = result.errors[key][0]
      }
    } else {
      errors.value.email = result.error || 'Registration failed. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

definePageMeta({
  middleware: ['guest']
})

useSeoMeta({
  title: 'Create a Free Account — Farmconsul',
  description: 'Join Farmconsul and manage crops, livestock, workers and harvests from your phone — even offline. Every plan starts with a 14-day free trial.',
  ogTitle: 'Create a Free Account — Farmconsul',
  ogDescription: 'Join Farmconsul and manage crops, livestock, workers and harvests from your phone — even offline. Every plan starts with a 14-day free trial.',
  ogUrl: 'https://farmconsul.com/register',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://farmconsul.com/register' }],
})
</script>

<style scoped>
/* Intentionally present: cached dev-server/service-worker module graphs
   request this SFC's scoped style block; removing it breaks HMR with a
   PostCSS "Unknown word" error until every client cache is purged. */
</style>
