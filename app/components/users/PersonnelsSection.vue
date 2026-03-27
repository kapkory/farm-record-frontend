<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Total Personnels</p>
        <p class="mt-1 text-2xl font-bold text-gray-900">{{ personnels.length }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Managers</p>
        <p class="mt-1 text-2xl font-bold text-blue-600">{{ managerCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Workers</p>
        <p class="mt-1 text-2xl font-bold text-green-600">{{ workerCount }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-gray-500">Support Team</p>
        <p class="mt-1 text-2xl font-bold text-amber-600">{{ supportCount }}</p>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full max-w-md">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            v-model="search"
            type="search"
            placeholder="Search by name, role, phone, email or notes"
            class="pl-9"
          />
        </div>

        <button
          type="button"
          @click="openPersonnelModal"
          class="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          <Plus class="h-4 w-4" />
          Add Personnel
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading personnels...</span>
      </div>

      <div v-else-if="error" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load personnels</p>
        <p class="mt-1 text-sm">{{ error }}</p>
        <button @click="fetchPersonnels" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="personnel in filteredPersonnels" :key="personnel.id ?? `${personnel.name}-${personnel.phone}`" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ personnel.name || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="roleBadgeClass(personnel.role)">{{ personnel.role || '—' }}</span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ personnel.phone || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ personnel.email || '—' }}</td>
              <td class="max-w-md px-6 py-4 text-sm text-gray-500">{{ personnel.notes || '—' }}</td>
            </tr>
            <tr v-if="!filteredPersonnels.length">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">No personnels found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showPersonnelModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closePersonnelModal"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Add Personnel</h3>
                <p class="mt-1 text-sm text-gray-500">Save workers or service providers who do not need login access.</p>
              </div>
              <button @click="closePersonnelModal" class="text-gray-400 hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="submitPersonnel" class="space-y-5 p-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label for="personnel_name" class="mb-1 block text-sm font-medium text-gray-700">Name</Label>
                  <Input id="personnel_name" v-model="personnelForm.name" type="text" required class="w-full" />
                  <p v-if="personnelFormErrors.name" class="mt-1 text-xs text-red-600">{{ personnelFormErrors.name }}</p>
                </div>

                <div>
                  <Label for="personnel_role" class="mb-1 block text-sm font-medium text-gray-700">Role</Label>
                  <select
                    id="personnel_role"
                    v-model="personnelForm.role"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select role</option>
                    <option v-for="role in personnelRoleOptions" :key="role" :value="role">{{ formatRole(role) }}</option>
                  </select>
                  <p v-if="personnelFormErrors.role" class="mt-1 text-xs text-red-600">{{ personnelFormErrors.role }}</p>
                </div>

                <div>
                  <Label for="personnel_phone" class="mb-1 block text-sm font-medium text-gray-700">Phone</Label>
                  <Input id="personnel_phone" v-model="personnelForm.phone" type="text" required class="w-full" />
                  <p v-if="personnelFormErrors.phone" class="mt-1 text-xs text-red-600">{{ personnelFormErrors.phone }}</p>
                </div>

                <div>
                  <Label for="personnel_email" class="mb-1 block text-sm font-medium text-gray-700">Email</Label>
                  <Input id="personnel_email" v-model="personnelForm.email" type="email" class="w-full" />
                  <p v-if="personnelFormErrors.email" class="mt-1 text-xs text-red-600">{{ personnelFormErrors.email }}</p>
                </div>
              </div>

              <div>
                <Label for="personnel_notes" class="mb-1 block text-sm font-medium text-gray-700">Notes</Label>
                <textarea
                  id="personnel_notes"
                  v-model="personnelForm.notes"
                  rows="3"
                  placeholder="Optional notes about this person"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
                <p v-if="personnelFormErrors.notes" class="mt-1 text-xs text-red-600">{{ personnelFormErrors.notes }}</p>
              </div>

              <div v-if="personnelSubmitError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <p class="font-medium">Please fix the following before saving:</p>
                <p class="mt-1">{{ personnelSubmitError }}</p>
                <ul v-if="personnelErrorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in personnelErrorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" @click="closePersonnelModal" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting">Saving...</span>
                  <span v-else>Save Personnel</span>
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

type PersonnelRole = 'casual' | 'veterinary' | 'worker' | 'manager'
type PersonnelFormErrorKey = 'name' | 'role' | 'phone' | 'email' | 'notes'
type PersonnelValidationErrors = Partial<Record<PersonnelFormErrorKey, string>>

interface PersonnelRecord {
  id?: number | string
  name: string | null
  role: string | null
  phone: string | null
  email: string | null
  notes: string | null
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const personnelRoleOptions: PersonnelRole[] = ['casual', 'veterinary', 'worker', 'manager']

const personnels = ref<PersonnelRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')

const showPersonnelModal = ref(false)
const submitting = ref(false)
const personnelSubmitError = ref<string | null>(null)
const personnelFormErrors = ref<PersonnelValidationErrors>({})
const personnelErrorList = ref<string[]>([])

const defaultPersonnelForm = () => ({
  name: '',
  role: '',
  phone: '',
  email: '',
  notes: ''
})

const personnelForm = ref(defaultPersonnelForm())

const filteredPersonnels = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return personnels.value

  return personnels.value.filter((personnel) =>
    [personnel.name, personnel.role, personnel.phone, personnel.email, personnel.notes]
      .some((value) => (value ?? '').toLowerCase().includes(query))
  )
})

const managerCount = computed(() => personnels.value.filter((personnel) => (personnel.role ?? '').toLowerCase() === 'manager').length)
const workerCount = computed(() => personnels.value.filter((personnel) => (personnel.role ?? '').toLowerCase() === 'worker').length)
const supportCount = computed(() => personnels.value.filter((personnel) => ['casual', 'veterinary'].includes((personnel.role ?? '').toLowerCase())).length)

const formatRole = (role: string | null) => {
  if (!role) return '—'
  return role.replace(/_/g, ' ')
}

const roleBadgeClass = (role: string | null) => {
  const base = 'rounded-full px-2 py-1 text-xs font-semibold capitalize'
  const normalizedRole = (role ?? '').toLowerCase()

  if (normalizedRole === 'manager') return `${base} bg-blue-100 text-blue-800`
  if (normalizedRole === 'worker') return `${base} bg-green-100 text-green-800`
  if (normalizedRole === 'veterinary') return `${base} bg-purple-100 text-purple-800`
  return `${base} bg-amber-100 text-amber-800`
}

const setPersonnelValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
  const mapped: PersonnelValidationErrors = {}
  const list: string[] = []

  if (!errors) {
    personnelFormErrors.value = {}
    personnelErrorList.value = []
    return
  }

  for (const [key, value] of Object.entries(errors)) {
    const message = Array.isArray(value) ? value[0] : value
    if (!message) continue

    list.push(message)

    if (key === 'name') mapped.name = message
    if (key === 'role') mapped.role = message
    if (key === 'phone') mapped.phone = message
    if (key === 'email') mapped.email = message
    if (key === 'notes') mapped.notes = message
  }

  personnelFormErrors.value = mapped
  personnelErrorList.value = [...new Set(list)]
}

const openPersonnelModal = () => {
  personnelSubmitError.value = null
  personnelFormErrors.value = {}
  personnelErrorList.value = []
  personnelForm.value = defaultPersonnelForm()
  showPersonnelModal.value = true
}

const closePersonnelModal = () => {
  showPersonnelModal.value = false
  personnelSubmitError.value = null
  personnelFormErrors.value = {}
  personnelErrorList.value = []
}

const fetchPersonnels = async () => {
  loading.value = true
  error.value = null

  try {
    if (!isOnline.value) {
      personnels.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: PersonnelRecord[] }>('/api/v1/farms/farm/users/personnels/list')
    personnels.value = response.data ?? []
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An error occurred while loading personnels'
    console.error('Failed to fetch personnels:', err)
    personnels.value = []
  } finally {
    loading.value = false
  }
}

const submitPersonnel = async () => {
  submitting.value = true
  personnelSubmitError.value = null
  personnelFormErrors.value = {}
  personnelErrorList.value = []

  const payload = {
    name: personnelForm.value.name.trim(),
    role: personnelForm.value.role,
    phone: personnelForm.value.phone.trim(),
    email: personnelForm.value.email.trim() || null,
    notes: personnelForm.value.notes.trim() || null,
  }

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch('/api/v1/farms/farm/users/personnels', {
      method: 'POST',
      body: payload
    })

    await fetchPersonnels()
    closePersonnelModal()
  } catch (err: unknown) {
    const responseData = typeof err === 'object' && err !== null && 'data' in err
      ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
      : undefined

    setPersonnelValidationErrors(responseData?.errors)
    personnelSubmitError.value = responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save personnel')
    console.error('Failed to save personnel:', err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchPersonnels()
})
</script>