<template>
  <div class="space-y-6">
    <!-- Back nav -->
    <div>
      <button @click="router.back()" class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <ChevronLeft class="w-4 h-4" />
        Back
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading planting...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
      <p class="font-medium">Failed to load planting</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchPlanting" class="mt-3 text-sm underline hover:no-underline">Try again</button>
    </div>

    <template v-else-if="planting">
      <!-- Header Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Identity + actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout class="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ planting.crop?.name ?? 'Unknown Crop' }}</h1>
              <p class="text-gray-500 text-sm mt-0.5">{{ planting.crop_variety?.name ?? 'No variety specified' }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <span :class="[
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  planting.actual_harvest_date ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                ]">
                  {{ planting.actual_harvest_date ? 'Harvested' : 'Growing' }}
                </span>
                <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                  {{ planting.purpose ?? '—' }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Pencil class="w-4 h-4" />
              Edit
            </button>
            <button class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">
              <Trash2 class="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
        <!-- Stats strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 border-t border-gray-100 bg-gray-50 divide-x divide-gray-100">
          <div class="px-5 py-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Farm</p>
            <p class="text-sm font-semibold text-gray-900 mt-0.5 truncate">{{ planting.farm?.name ?? '—' }}</p>
          </div>
          <div class="px-5 py-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Field</p>
            <p class="text-sm font-semibold text-gray-900 mt-0.5 truncate">{{ planting.field?.name ?? '—' }}</p>
            <p v-if="planting.field?.size" class="text-xs text-gray-400">{{ planting.field.size }}</p>
          </div>
          <div class="px-5 py-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Qty Planted</p>
            <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ planting.quantity_planted ?? '—' }}</p>
          </div>
          <div class="px-5 py-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Total Expenses</p>
            <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ formatCurrency(totalExpenses) }}</p>
          </div>
        </div>
      </div>

   

      <!-- Detail Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Planting Details</h2>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Date Planted</p>
            <p class="text-sm font-semibold text-gray-900 mt-1">{{ planting.date_planted }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Harvest</p>
            <p class="text-sm font-semibold text-gray-900 mt-1">{{ planting.expected_harvest_date ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Actual Harvest</p>
            <p class="text-sm font-semibold text-gray-900 mt-1">{{ planting.actual_harvest_date ?? 'Not yet harvested' }}</p>
          </div>
          <div v-if="planting.description" class="sm:col-span-2 md:col-span-3">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes / Description</p>
            <p class="text-sm text-gray-700 mt-1 whitespace-pre-line">{{ planting.description }}</p>
          </div>
        </div>
      </div>

      <!-- Expenses Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Expenses</h2>
            <p class="text-sm text-gray-500 mt-0.5">Costs associated with this planting</p>
          </div>
          <button
            @click="showAddExpense = true"
            class="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3 py-2 rounded-md transition-colors"
          >
            <Plus class="w-4 h-4" />
            Add Expense
          </button>
        </div>

        <!-- Category summary -->
        <div v-if="expenses.length" class="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div v-for="cat in expenseSummary" :key="cat.category">
            <p class="text-xs text-gray-500 uppercase tracking-wide capitalize">{{ cat.category }}</p>
            <p class="text-base font-bold text-gray-900 mt-0.5">{{ formatCurrency(cat.total) }}</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ expense.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full capitalize',
                    expense.category === 'seeds'      ? 'bg-green-100 text-green-800'  :
                    expense.category === 'fertilizer' ? 'bg-yellow-100 text-yellow-800':
                    expense.category === 'labour'     ? 'bg-blue-100 text-blue-800'    :
                    expense.category === 'pesticides' ? 'bg-red-100 text-red-800'      :
                                                        'bg-gray-100 text-gray-800'
                  ]">{{ expense.category }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ expense.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                  {{ formatCurrency(expense.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-gray-600 hover:text-gray-900 mr-3"><Pencil class="w-4 h-4" /></button>
                  <button class="text-red-500 hover:text-red-700"><Trash2 class="w-4 h-4" /></button>
                </td>
              </tr>
              <tr v-if="!expenses.length">
                <td colspan="5" class="px-6 py-10 text-center text-gray-500 text-sm">
                  No expenses recorded yet.
                  <button @click="showAddExpense = true" class="ml-1 text-green-600 underline hover:no-underline">Add the first expense.</button>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="expenses.length" class="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colspan="3" class="px-6 py-3 text-sm font-semibold text-gray-700 text-right">Total</td>
                <td class="px-6 py-3 text-right text-sm font-bold text-gray-900">{{ formatCurrency(totalExpenses) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>

    <!-- Add Expense Modal -->
    <Teleport to="body">
      <div v-if="showAddExpense" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="showAddExpense = false"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Add Expense</h3>
              <button @click="showAddExpense = false" class="text-gray-400 hover:text-gray-600">
                <X class="w-5 h-5" />
              </button>
            </div>
            <form @submit.prevent="submitExpense" class="p-4 space-y-4">
              <div>
                <Label for="exp_date" class="block text-sm font-medium text-gray-700 mb-1">Date</Label>
                <Input id="exp_date" v-model="expenseForm.date" type="date" required class="w-full" />
              </div>
              <div>
                <Label for="exp_category" class="block text-sm font-medium text-gray-700 mb-1">Category</Label>
                <select id="exp_category" v-model="expenseForm.category" required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Select category</option>
                  <option value="seeds">Seeds</option>
                  <option value="fertilizer">Fertilizer</option>
                  <option value="labour">Labour</option>
                  <option value="pesticides">Pesticides</option>
                  <option value="equipment">Equipment</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label for="exp_desc" class="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                <Input id="exp_desc" v-model="expenseForm.description" type="text" placeholder="Brief description" required class="w-full" />
              </div>
              <div>
                <Label for="exp_amount" class="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</Label>
                <Input id="exp_amount" v-model="expenseForm.amount" type="number" min="0" step="0.01" placeholder="0.00" required class="w-full" />
              </div>
              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" @click="showAddExpense = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit">Save Expense</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ChevronLeft, Sprout, Pencil, Trash2, Plus, X } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

interface Planting {
  uuid: string
  farm: { uuid: string; name: string } | null
  field: { name: string; size: string } | null
  crop: { name: string } | null
  crop_variety: { name: string } | null
  date_planted: string
  expected_harvest_date: string | null
  actual_harvest_date: string | null
  quantity_planted: number | null
  purpose: string | null
  description: string | null
}

interface Expense {
  id: number
  date: string
  category: string
  description: string
  amount: number
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const route = useRoute()
const router = useRouter()

const plantingUuid = computed(() => route.params.uuid as string)

const planting = ref<Planting | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showAddExpense = ref(false)

// ── Dummy expenses ──────────────────────────────────────────────────────────
const expenses = ref<Expense[]>([
  { id: 1, date: '2025-04-02', category: 'seeds',      description: 'Certified hybrid seed purchase',        amount: 4800 },
  { id: 2, date: '2025-04-10', category: 'fertilizer', description: 'DAP basal fertilizer – first top dress', amount: 7200 },
  { id: 3, date: '2025-04-15', category: 'labour',     description: 'Planting labour crew (3 days)',           amount: 3600 },
  { id: 4, date: '2025-05-08', category: 'fertilizer', description: 'CAN top dressing',                       amount: 4500 },
  { id: 5, date: '2025-05-20', category: 'pesticides', description: 'Pesticide spray – stalk borer control',  amount: 2400 },
])

const expenseSummary = computed(() => {
  const map: Record<string, number> = {}
  for (const e of expenses.value) {
    map[e.category] = (map[e.category] ?? 0) + e.amount
  }
  return Object.entries(map).map(([category, total]) => ({ category, total }))
})

const totalExpenses = computed(() => expenses.value.reduce((s, e) => s + e.amount, 0))

const expenseForm = ref({ date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '' })

const submitExpense = () => {
  expenses.value.push({
    id: Date.now(),
    date: expenseForm.value.date,
    category: expenseForm.value.category,
    description: expenseForm.value.description,
    amount: Number(expenseForm.value.amount)
  })
  expenseForm.value = { date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '' }
  showAddExpense.value = false
}

// ── API ──────────────────────────────────────────────────────────────────────
const fetchPlanting = async () => {
  loading.value = true
  error.value = null
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Planting }>(`/api/v1/farms/farm/planting/${plantingUuid.value}`)
      planting.value = response.data
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An error occurred while loading this planting'
    console.error('Failed to fetch planting:', err)
    error.value = msg
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)

onMounted(() => {
  fetchPlanting()
})
</script>
