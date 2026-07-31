<template>
  <div class="mx-auto max-w-lg space-y-6">
    <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <p class="font-medium">You need to set a new password before continuing.</p>
      <p class="mt-1">This account was created with a temporary password. Choose a new one to keep it secure.</p>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 class="text-lg font-semibold text-gray-900">Change your password</h1>

      <form @submit.prevent="submit" class="mt-5 space-y-4">
        <div>
          <Label for="current_password" class="mb-1 block text-sm font-medium text-gray-700">Current (temporary) password</Label>
          <Input id="current_password" v-model="form.current_password" type="password" required autocomplete="current-password" class="w-full" />
          <p v-if="fieldErrors.current_password" class="mt-1 text-xs text-red-600">{{ fieldErrors.current_password }}</p>
        </div>

        <div>
          <Label for="new_password" class="mb-1 block text-sm font-medium text-gray-700">New password</Label>
          <Input id="new_password" v-model="form.password" type="password" required autocomplete="new-password" class="w-full" />
          <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600">{{ fieldErrors.password }}</p>
        </div>

        <div>
          <Label for="new_password_confirmation" class="mb-1 block text-sm font-medium text-gray-700">Confirm new password</Label>
          <Input id="new_password_confirmation" v-model="form.password_confirmation" type="password" required autocomplete="new-password" class="w-full" />
        </div>

        <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ submitError }}
        </div>

        <Button type="submit" :disabled="submitting" class="w-full">
          <span v-if="submitting">Saving...</span>
          <span v-else>Save new password</span>
        </Button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

const { $apiFetch } = useNuxtApp()
const authStore = useAuthStore()

type FieldErrorKey = 'current_password' | 'password'

const form = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const submitting = ref(false)
const submitError = ref<string | null>(null)
const fieldErrors = ref<Partial<Record<FieldErrorKey, string>>>({})

const submit = async () => {
  submitting.value = true
  submitError.value = null
  fieldErrors.value = {}

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch('/api/v1/user/password', {
      method: 'PUT',
      body: form.value
    })

    if (authStore.farmer) {
      authStore.farmer.must_change_password = false
    }

    await navigateTo('/admin')
  } catch (err: unknown) {
    const data = typeof err === 'object' && err !== null && 'data' in err
      ? (err as { data?: { message?: string; errors?: Record<string, string[]> } }).data
      : undefined

    const errors = data?.errors ?? {}
    fieldErrors.value = {
      current_password: errors.current_password?.[0],
      password: errors.password?.[0]
    }
    submitError.value = data?.message || 'Failed to update your password'
  } finally {
    submitting.value = false
  }
}
</script>
