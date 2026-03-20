<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Users</h1>
      <p class="mt-1 text-sm text-gray-500">View the people already registered in the farm system.</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Total Users</p>
        <p class="mt-1 text-2xl font-bold text-gray-900">{{ users.length }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Admins</p>
        <p class="mt-1 text-2xl font-bold text-blue-600">{{ adminCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Farmers</p>
        <p class="mt-1 text-2xl font-bold text-green-600">{{ farmerCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Other Roles</p>
        <p class="mt-1 text-2xl font-bold text-amber-600">{{ otherRoleCount }}</p>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4">
        <div class="relative max-w-md">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            v-model="search"
            type="search"
            placeholder="Search by name, email, phone or role"
            class="pl-9"
          />
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading users...</span>
      </div>

      <div v-else-if="error" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load users</p>
        <p class="mt-1 text-sm">{{ error }}</p>
        <button @click="fetchUsers" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="user in filteredUsers" :key="user.id ?? `${user.email}-${user.date_created}`" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-gray-900">{{ user.name || '—' }}</p>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ user.email || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="roleBadgeClass(user.role)">
                  {{ user.role || '—' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ user.phone || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ user.date_created || '—' }}</td>
            </tr>
            <tr v-if="!filteredUsers.length">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

useHead({
  title: 'Users Management - FarmConsul Admin'
})

interface UserRecord {
  id?: number | string
  name: string | null
  email: string | null
  role: string | null
  phone: string | null
  date_created: string | null
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const users = ref<UserRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return users.value

  return users.value.filter((user) =>
    [user.name, user.email, user.role, user.phone, user.date_created]
      .some((value) => (value ?? '').toLowerCase().includes(query))
  )
})

const adminCount = computed(() =>
  users.value.filter((user) => (user.role ?? '').toLowerCase() === 'admin').length
)

const farmerCount = computed(() =>
  users.value.filter((user) => (user.role ?? '').toLowerCase() === 'farmer').length
)

const otherRoleCount = computed(() => users.value.length - adminCount.value - farmerCount.value)

const roleBadgeClass = (role: string | null) => {
  const base = 'rounded-full px-2 py-1 text-xs font-semibold capitalize'
  const normalizedRole = (role ?? '').toLowerCase()

  if (normalizedRole === 'admin') return `${base} bg-blue-100 text-blue-800`
  if (normalizedRole === 'farmer') return `${base} bg-green-100 text-green-800`
  return `${base} bg-amber-100 text-amber-800`
}

const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    if (!isOnline.value) {
      users.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: UserRecord[] }>('/api/v1/farms/farm/users/list')
    users.value = response.data ?? []
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An error occurred while loading users'
    console.error('Failed to fetch users:', err)
    users.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
