<template>
  <div>
    <!-- Page Header -->
    <div class="mb-2">
      <h3 class="text-3xl font-bold text-gray-900">Add New Farm</h3>
      <p class="text-gray-600 mt-2">Create a new farm record in the system</p>
    </div>

    <!-- Form Container -->
    <div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <!-- Success Message -->
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <p class="text-green-700">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <p class="text-red-700">{{ generalError }}</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Row 1: Farm Name & Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Farm Name -->
            <div class="space-y-2">
              <label for="name" class="text-sm font-semibold text-gray-700 block">
                Farm Name <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Green Valley Farm"
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

            <!-- Location -->
            <div class="space-y-2">
              <label for="location" class="text-sm font-semibold text-gray-700 block">
                Location <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="location"
                  v-model="form.location"
                  type="text"
                  placeholder="City, State/Region"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{'border-red-500': errors.location}"
                />
                <div v-if="errors.location" class="absolute right-3 top-3">
                  <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <p v-if="errors.location" class="text-sm text-red-500 mt-1">{{ errors.location }}</p>
            </div>
          </div>

          <!-- Row 2: Farm Size & Size Unit -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Size -->
            <div class="space-y-2">
              <label for="size" class="text-sm font-semibold text-gray-700 block">
                Farm Size <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="size"
                  v-model.number="form.size"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100.50"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  :class="{'border-red-500': errors.size}"
                />
                <div v-if="errors.size" class="absolute right-3 top-3">
                  <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <p v-if="errors.size" class="text-sm text-red-500 mt-1">{{ errors.size }}</p>
            </div>

            <!-- Size Unit -->
            <div class="space-y-2">
              <label for="size_unit" class="text-sm font-semibold text-gray-700 block">
                Size Unit <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  id="size_unit"
                  v-model="form.size_unit"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 appearance-none bg-white"
                  :class="{'border-red-500': errors.size_unit}"
                >
                  <option value="" disabled>Select unit</option>
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
                <div class="absolute right-3 top-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
              <p v-if="errors.size_unit" class="text-sm text-red-500 mt-1">{{ errors.size_unit }}</p>
            </div>
          </div>

          <!-- Row 3: Farm Type & Ownership Type -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Farm Type -->
            <div class="space-y-2">
              <label for="farm_type" class="text-sm font-semibold text-gray-700 block">
                Farm Type <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  id="farm_type"
                  v-model="form.farm_type"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 appearance-none bg-white"
                  :class="{'border-red-500': errors.farm_type}"
                >
                  <option value="" disabled>Select farm type</option>
                  <option value="crop">Crop</option>
                  <option value="animal">Animal</option>
                  <option value="mixed">Mixed</option>
                </select>
                <div class="absolute right-3 top-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
              <p v-if="errors.farm_type" class="text-sm text-red-500 mt-1">{{ errors.farm_type }}</p>
            </div>

            <!-- Ownership Type -->
            <div class="space-y-2">
              <label for="ownership_type" class="text-sm font-semibold text-gray-700 block">
                Ownership Type <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  id="ownership_type"
                  v-model="form.ownership_type"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 appearance-none bg-white"
                  :class="{'border-red-500': errors.ownership_type}"
                >
                  <option value="" disabled>Select ownership type</option>
                  <option value="leased">Leased</option>
                  <option value="owned" selected>Owned</option>
                  <option value="shared">Shared</option>
                </select>
                <div class="absolute right-3 top-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
              <p v-if="errors.ownership_type" class="text-sm text-red-500 mt-1">{{ errors.ownership_type }}</p>
            </div>
          </div>

          <!-- Row 4: Established Date -->
          <div class="space-y-2">
            <label for="established_at" class="text-sm font-semibold text-gray-700 block">
              Established Date <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="established_at"
                v-model="form.established_at"
                type="date"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900"
                :class="{'border-red-500': errors.established_at}"
              />
              <div v-if="errors.established_at" class="absolute right-3 top-3">
                <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="errors.established_at" class="text-sm text-red-500 mt-1">{{ errors.established_at }}</p>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label for="description" class="text-sm font-semibold text-gray-700 block">
              Description
            </label>
            <div class="relative">
              <textarea
                id="description"
                v-model="form.description"
                rows="4"
                placeholder="Brief description about the farm..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 resize-none"
                :class="{'border-red-500': errors.description}"
              ></textarea>
            </div>
            <p v-if="errors.description" class="text-sm text-red-500 mt-1">{{ errors.description }}</p>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <NuxtLink
              to="/admin/farms"
              class="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Creating...' : 'Create Farm' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()

// Use injected apiFetch if available; otherwise create a compatible fallback
const apiFetch = (nuxtApp as any).$apiFetch || $fetch.create({
  baseURL: (config.public.apiBase || '').replace(/\/+$/, ''),
  credentials: 'include',
  headers: { Accept: 'application/json' },
  onRequest({ options }) {
    if (import.meta.client) {
      const match = document.cookie.match(/(^|;)\s*XSRF-TOKEN=([^;]+)/)
      const token = match && match[2] ? decodeURIComponent(match[2]) : null
      if (token) {
        (options.headers as any) = {
          ...(options.headers as any || {}),
          'X-XSRF-TOKEN': token
        }
      }
    }
  }
})
const router = useRouter()

// Form data
const form = ref({
  name: '',
  location: '',
  size: null as number | null,
  size_unit: 'acres',
  farm_type: '',
  ownership_type: '',
  established_at: '',
  description: ''
})

// Errors
const errors = ref({
  name: '',
  location: '',
  size: '',
  size_unit: '',
  farm_type: '',
  ownership_type: '',
  established_at: '',
  description: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const generalError = ref('')

// Validation function
const validateForm = () => {
  let isValid = true
  errors.value = {
    name: '',
    location: '',
    size: '',
    size_unit: '',
    farm_type: '',
    ownership_type: '',
    established_at: '',
    description: ''
  }

  // Name validation
  if (!form.value.name || form.value.name.length < 2) {
    errors.value.name = 'Farm name must be at least 2 characters'
    isValid = false
  }

  // Location validation
  if (!form.value.location || form.value.location.length < 2) {
    errors.value.location = 'Please enter a valid location'
    isValid = false
  }

  // Size validation
  if (!form.value.size || form.value.size <= 0) {
    errors.value.size = 'Farm size must be greater than 0'
    isValid = false
  }

  // Size unit validation
  if (!form.value.size_unit) {
    errors.value.size_unit = 'Please select a size unit'
    isValid = false
  }

  // Farm type validation
  if (!form.value.farm_type) {
    errors.value.farm_type = 'Please select a farm type'
    isValid = false
  }

  // Ownership type validation
  if (!form.value.ownership_type) {
    errors.value.ownership_type = 'Please select an ownership type'
    isValid = false
  }

  // Established date validation
  if (!form.value.established_at) {
    errors.value.established_at = 'Please select an established date'
    isValid = false
  }

  return isValid
}

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  successMessage.value = ''
  generalError.value = ''

  try {
    // Ensure CSRF cookie is set
    await apiFetch('/sanctum/csrf-cookie')

    // Create farm
    const response = await apiFetch('/api/v1/farms', {
      method: 'POST',
      body: {
        name: form.value.name,
        location: form.value.location,
        size: form.value.size,
        size_unit: form.value.size_unit,
        type: form.value.farm_type,
        ownership_type: form.value.ownership_type,
        established_at: form.value.established_at,
        description: form.value.description
      }
    })

    successMessage.value = 'Farm created successfully!'
    
    // Redirect to farms list after a short delay
    setTimeout(() => {
      router.push('/admin/farms')
    }, 1500)

  } catch (err: any) {
    console.error('Farm creation error:', err)
    
    const resData = err?.response?.data || err?.data

    // Handle validation errors
    if (resData?.errors) {
      const validationErrors = resData.errors
      
      // Map backend validation errors to form fields
      Object.keys(validationErrors).forEach((key) => {
        if (errors.value.hasOwnProperty(key)) {
          const msgs = validationErrors[key]
          if (msgs && msgs.length > 0) {
            errors.value[key as keyof typeof errors.value] = msgs[0]
          }
        }
      })
      
      generalError.value = 'Please correct the errors below'
    } else {
      generalError.value = resData?.message || 'Failed to create farm. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// Page metadata
useHead({
  title: 'Add New Farm - Farm Management',
  meta: [
    { name: 'description', content: 'Add a new farm to the management system' }
  ]
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
