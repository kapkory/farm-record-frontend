<template>
  <div class="space-y-4">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading categories...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load categories</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchData" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <template v-else>
      <!-- Type tabs + Add button -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
          <button
            v-for="tab in tabTypes"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.value ? tab.activeClass : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <span class="flex items-center gap-1.5">
              <component :is="tab.icon" class="w-3.5 h-3.5" />
              {{ tab.label }}
              <span :class="[
                'ml-1 px-1.5 py-0.5 text-xs rounded-full font-semibold',
                activeTab === tab.value ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
              ]">{{ countByType(tab.value) }}</span>
            </span>
          </button>
        </div>
        <Button @click="openAddModal">
          <Plus class="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <!-- Helper banner -->
      <div :class="['rounded-lg px-4 py-3 text-sm flex items-start gap-3 border', activeTabConfig.bannerClass]">
        <Info class="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <span class="font-medium capitalize">{{ activeTab }} accounts</span>
          {{ ' — ' + activeTabConfig.desc }}
          You can nest sub-accounts under a parent using the <strong>Parent</strong> field.
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">

        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in filteredCategories" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span :class="['w-2 h-2 rounded-full flex-shrink-0', typeConfig(item.type).dotClass]"></span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ item.parent_id ? '↳ ' : '' }}{{ item.name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ parentName(item.parent_id) ?? '—' }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ item.description ?? '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="item.is_system" class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">System</span>
                <span v-else class="text-gray-300 text-sm">—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editItem(item)" :disabled="item.is_system"
                  :class="['mr-3', item.is_system ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:text-green-900']"
                  :title="item.is_system ? 'System categories cannot be edited' : 'Edit'">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="deleteItem(item)" :disabled="item.is_system"
                  :class="[item.is_system ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700']"
                  :title="item.is_system ? 'System categories cannot be deleted' : 'Delete'">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredCategories.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No {{ activeTab }} categories yet.
                <button @click="openAddModal" class="ml-1 text-green-600 underline hover:no-underline">Add one now.</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div class="flex items-center gap-2">
                <span :class="['w-2.5 h-2.5 rounded-full', typeConfig(form.type).dotClass]"></span>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ isEditing ? 'Edit' : 'Add' }} Ledger Account
                </h3>
              </div>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="submitForm" class="p-5 space-y-4">
              <!-- Type selector -->
              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-1.5">Account Type <span class="text-red-500">*</span></Label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="t in tabTypes"
                    :key="t.value"
                    type="button"
                    @click="form.type = t.value; form.parent_id = null"
                    :class="[
                      'flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors',
                      form.type === t.value ? [t.activeClass, 'border-transparent'] : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    ]"
                  >
                    <component :is="t.icon" class="w-4 h-4" />
                    {{ t.label }}
                  </button>
                </div>
              </div>

              <!-- Name -->
              <div>
                <Label for="cat_name" class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></Label>
                <Input id="cat_name" v-model="form.name"
                  type="text" placeholder="e.g. Fertilizer Costs" required class="w-full" />
              </div>

              <!-- Parent category -->
              <div>
                <Label for="cat_parent" class="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category <span class="text-xs text-gray-400 font-normal ml-1">(optional — for sub-categories)</span>
                </Label>
                <select id="cat_parent" v-model="form.parent_id"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option :value="null">— None (top-level) —</option>
                  <option v-for="parent in parentOptions" :key="parent.id" :value="parent.id">
                    {{ parent.name }}
                  </option>
                </select>
                <p class="text-xs text-gray-400 mt-1">Only top-level {{ form.type }} categories are shown.</p>
              </div>

              <!-- Description -->
              <div>
                <Label for="cat_desc" class="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                <textarea id="cat_desc" v-model="form.description" rows="2"
                  placeholder="Brief description of what this category covers"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
              </div>

              <!-- Submit error -->
              <div v-if="submitError" class="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                {{ submitError }}
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button type="button" @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting" class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </span>
                  <span v-else>{{ isEditing ? 'Update' : 'Save' }} Category</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { Plus, Pencil, Trash2, X, Landmark, CreditCard, Scale, TrendingUp, TrendingDown, Info } from 'lucide-vue-next'

type LedgerType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

interface LedgerAccount {
  id: number
  uuid?: string
  name: string
  type: LedgerType
  description: string | null
  is_system: boolean
  parent_id: number | null
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const categories = ref<LedgerAccount[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const submitError = ref<string | null>(null)
const editingId = ref<number | null>(null)
const editingUuid = ref<string | null>(null)

const activeTab = ref<LedgerType>('expense')

const tabTypes = [
  { value: 'asset'     as const, label: 'Asset',     icon: Landmark,     activeClass: 'bg-blue-500 text-white',   dotClass: 'bg-blue-500',   bannerClass: 'bg-blue-50 border-blue-200 text-blue-800',       desc: 'Things the farm owns — land, equipment, buildings, cash, inventory.' },
  { value: 'liability' as const, label: 'Liability',  icon: CreditCard,   activeClass: 'bg-amber-500 text-white',  dotClass: 'bg-amber-500',  bannerClass: 'bg-amber-50 border-amber-200 text-amber-800',     desc: 'What the farm owes — loans, credit, accounts payable.' },
  { value: 'equity'    as const, label: 'Equity',     icon: Scale,        activeClass: 'bg-purple-500 text-white', dotClass: 'bg-purple-500', bannerClass: 'bg-purple-50 border-purple-200 text-purple-800', desc: "Owner's stake in the farm — capital contributed and retained earnings." },
  { value: 'revenue'   as const, label: 'Revenue',    icon: TrendingUp,   activeClass: 'bg-green-500 text-white',  dotClass: 'bg-green-500',  bannerClass: 'bg-green-50 border-green-200 text-green-800',     desc: 'Money earned — crop sales, livestock sales, service income.' },
  { value: 'expense'   as const, label: 'Expense',    icon: TrendingDown, activeClass: 'bg-red-500 text-white',    dotClass: 'bg-red-500',    bannerClass: 'bg-red-50 border-red-200 text-red-800',           desc: 'Money spent — seeds, fertilizer, labour, fuel, repairs.' },
]

const activeTabConfig = computed(() => tabTypes.find(t => t.value === activeTab.value)!)
const typeConfig = (type: LedgerType) => tabTypes.find(t => t.value === type)!

const defaultForm = () => ({
  name: '',
  type: activeTab.value as LedgerType,
  description: '',
  parent_id: null as number | null,
})

const form = ref(defaultForm())

// ── Derived ──────────────────────────────────────────────────────────────────

const filteredCategories = computed(() =>
  categories.value.filter(c => c.type === activeTab.value)
)

const countByType = (type: string) =>
  categories.value.filter(c => c.type === type).length

const parentOptions = computed(() =>
  categories.value.filter(c => c.type === form.value.type && c.parent_id === null && c.id !== editingId.value)
)

const parentName = (parentId: number | null) => {
  if (!parentId) return null
  return categories.value.find(c => c.id === parentId)?.name ?? null
}

// ── Modal ─────────────────────────────────────────────────────────────────────

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  editingUuid.value = null
  submitError.value = null
  form.value = defaultForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  submitError.value = null
}

const submitForm = async () => {
  submitting.value = true
  submitError.value = null

  const payload = {
    name: form.value.name,
    type: form.value.type,
    description: form.value.description || null,
    parent_id: form.value.parent_id,
  }

  try {
    await $apiFetch('/sanctum/csrf-cookie')

    if (isEditing.value && editingUuid.value) {
      const response = await $apiFetch<{ data: LedgerAccount }>(
        `/api/v1/settings/system/ledgeraccounts/${editingUuid.value}`,
        { method: 'PUT', body: payload }
      )
      const idx = categories.value.findIndex(c => c.uuid === editingUuid.value)
      if (idx !== -1) categories.value[idx] = response.data
    } else {
      const response = await $apiFetch<{ data: LedgerAccount }>(
        '/api/v1/settings/system/ledgeraccounts',
        { method: 'POST', body: payload }
      )
      categories.value.push(response.data)
      activeTab.value = response.data.type
    }

    closeModal()
  } catch (err: unknown) {
    submitError.value = err instanceof Error ? err.message : 'Failed to save account. Please try again.'
    console.error('Failed to save ledger account:', err)
  } finally {
    submitting.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: LedgerAccount[] }>('/api/v1/settings/system/ledgeraccounts/list')
      categories.value = response.data ?? (response as unknown as LedgerAccount[])
    } else {
      categories.value = []
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An error occurred while loading accounts'
    categories.value = []
  } finally {
    loading.value = false
  }
}

const editItem = (item: LedgerAccount) => {
  if (item.is_system) return
  isEditing.value = true
  editingId.value = item.id
  editingUuid.value = item.uuid ?? null
  submitError.value = null
  form.value = {
    name: item.name,
    type: item.type,
    description: item.description ?? '',
    parent_id: item.parent_id,
  }
  showModal.value = true
}

const deleteItem = async (item: LedgerAccount) => {
  if (item.is_system) return
  if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    const id = item.uuid ?? item.id
    await $apiFetch(`/api/v1/settings/system/ledgeraccounts/${id}`, { method: 'DELETE' })
    categories.value = categories.value.filter(c => c.id !== item.id)
  } catch (err: unknown) {
    alert('Failed to delete account: ' + (err instanceof Error ? err.message : 'Unknown error'))
  }
}

onMounted(() => {
  fetchData()
})
</script>
