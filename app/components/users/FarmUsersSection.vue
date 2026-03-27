<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Total Users</p>
        <p class="mt-1 text-2xl font-bold text-gray-900">{{ users.length }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Owners</p>
        <p class="mt-1 text-2xl font-bold text-blue-600">{{ ownerCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Managers</p>
        <p class="mt-1 text-2xl font-bold text-green-600">{{ managerCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Staff</p>
        <p class="mt-1 text-2xl font-bold text-amber-600">{{ staffCount }}</p>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full max-w-md">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            v-model="search"
            type="search"
            placeholder="Search by name, email, phone or role"
            class="pl-9"
          />
        </div>

        <button
          type="button"
          @click="openUserModal"
          class="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          <Plus class="h-4 w-4" />
          Add User
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading farm users...</span>
      </div>

      <div v-else-if="error" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load farm users</p>
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
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ user.name || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ user.email || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="roleBadgeClass(user.role)">{{ user.role || '—' }}</span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ user.phone || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ user.date_created || '—' }}</td>
            </tr>
            <tr v-if="!filteredUsers.length">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">No farm users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showUserModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeUserModal"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Add User</h3>
                <p class="mt-1 text-sm text-gray-500">Create a login user for the farm team.</p>
              </div>
              <button @click="closeUserModal" class="text-gray-400 hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="submitUser" class="space-y-5 p-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label for="farm_user_name" class="mb-1 block text-sm font-medium text-gray-700">Name</Label>
                  <Input id="farm_user_name" v-model="userForm.name" type="text" required class="w-full" />
                  <p v-if="userFormErrors.name" class="mt-1 text-xs text-red-600">{{ userFormErrors.name }}</p>
                </div>

                <div>
                  <Label for="farm_user_email" class="mb-1 block text-sm font-medium text-gray-700">Email</Label>
                  <Input id="farm_user_email" v-model="userForm.email" type="email" required class="w-full" />
                  <p v-if="userFormErrors.email" class="mt-1 text-xs text-red-600">{{ userFormErrors.email }}</p>
                </div>

                <div>
                  <Label for="farm_user_role" class="mb-1 block text-sm font-medium text-gray-700">Role</Label>
                  <select
                    id="farm_user_role"
                    v-model="userForm.role"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select role</option>
                    <option v-for="role in userRoleOptions" :key="role" :value="role">{{ formatRole(role) }}</option>
                  </select>
                  <p v-if="userFormErrors.role" class="mt-1 text-xs text-red-600">{{ userFormErrors.role }}</p>
                </div>

                <div>
                  <Label for="farm_user_phone" class="mb-1 block text-sm font-medium text-gray-700">Phone</Label>
                  <Input id="farm_user_phone" v-model="userForm.phone" type="text" class="w-full" />
                  <p v-if="userFormErrors.phone" class="mt-1 text-xs text-red-600">{{ userFormErrors.phone }}</p>
                </div>
              </div>

              <div v-if="userSubmitError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <p class="font-medium">Please fix the following before saving:</p>
                <p class="mt-1">{{ userSubmitError }}</p>
                <ul v-if="userErrorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in userErrorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" @click="closeUserModal" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting">Saving...</span>
                  <span v-else>Save User</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus, Search, X } from 'lucide-vue-next'

type UserRole = 'owner' | 'manager' | 'staff'
type UserFormErrorKey = 'name' | 'email' | 'role' | 'phone'
type UserValidationErrors = Partial<Record<UserFormErrorKey, string>>

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

const userRoleOptions: UserRole[] = ['owner', 'manager', 'staff']

const users = ref<UserRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')

const showUserModal = ref(false)
const submitting = ref(false)
const userSubmitError = ref<string | null>(null)
const userFormErrors = ref<UserValidationErrors>({})
const userErrorList = ref<string[]>([])

const defaultUserForm = () => ({
  name: '',
  email: '',
  role: '',
  phone: ''
})

const userForm = ref(defaultUserForm())

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return users.value

  return users.value.filter((user) =>
    [user.name, user.email, user.role, user.phone, user.date_created]
      .some((value) => (value ?? '').toLowerCase().includes(query))
  )
})

const ownerCount = computed(() => users.value.filter((user) => (user.role ?? '').toLowerCase() === 'owner').length)
const managerCount = computed(() => users.value.filter((user) => (user.role ?? '').toLowerCase() === 'manager').length)
const staffCount = computed(() => users.value.filter((user) => (user.role ?? '').toLowerCase() === 'staff').length)

const formatRole = (role: string | null) => {
  if (!role) return '—'
  return role.replace(/_/g, ' ')
}

const roleBadgeClass = (role: string | null) => {
  const base = 'rounded-full px-2 py-1 text-xs font-semibold capitalize'
  const normalizedRole = (role ?? '').toLowerCase()

  if (normalizedRole === 'owner') return `${base} bg-blue-100 text-blue-800`
  if (normalizedRole === 'manager') return `${base} bg-green-100 text-green-800`
  return `${base} bg-amber-100 text-amber-800`
}

const setUserValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
  const mapped: UserValidationErrors = {}
  const list: string[] = []

  if (!errors) {
    userFormErrors.value = {}
    userErrorList.value = []
    return
  }

  for (const [key, value] of Object.entries(errors)) {
    const message = Array.isArray(value) ? value[0] : value
    if (!message) continue

    list.push(message)

    if (key === 'name') mapped.name = message
    if (key === 'email') mapped.email = message
    if (key === 'role') mapped.role = message
    if (key === 'phone') mapped.phone = message
  }

  userFormErrors.value = mapped
  userErrorList.value = [...new Set(list)]
}

const openUserModal = () => {
  userSubmitError.value = null
  userFormErrors.value = {}
  userErrorList.value = []
  userForm.value = defaultUserForm()
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  userSubmitError.value = null
  userFormErrors.value = {}
  userErrorList.value = []
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
    error.value = err instanceof Error ? err.message : 'An error occurred while loading farm users'
    console.error('Failed to fetch users:', err)
    users.value = []
  } finally {
    loading.value = false
  }
}

const submitUser = async () => {
  submitting.value = true
  userSubmitError.value = null
  userFormErrors.value = {}
  userErrorList.value = []

  const payload = {
    name: userForm.value.name.trim(),
    email: userForm.value.email.trim(),
    role: userForm.value.role,
    phone: userForm.value.phone.trim() || null,
  }

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch('/api/v1/farms/farm/users', {
      method: 'POST',
      body: payload
    })

    await fetchUsers()
    closeUserModal()
  } catch (err: unknown) {
    const responseData = typeof err === 'object' && err !== null && 'data' in err
      ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
      : undefined

    setUserValidationErrors(responseData?.errors)
    userSubmitError.value = responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save user')
    console.error('Failed to save user:', err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>