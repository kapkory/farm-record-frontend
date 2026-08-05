<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Farm Costs</h3>
        <p class="text-sm text-gray-500">Whole-farm expenses — salaries, rent, a dip day for the whole herd — not tied to one animal or crop.</p>
      </div>
      <div class="flex gap-2">
        <button class="inline-flex items-center px-3 py-2 bg-white border border-green-500 text-green-600 text-sm font-semibold rounded-lg hover:bg-green-50" @click="openSalary">
          <Users class="w-4 h-4 mr-2" />
          Record Salary
        </button>
        <button class="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg" @click="openExpense">
          <Plus class="w-4 h-4 mr-2" />
          Record Expense
        </button>
      </div>
    </div>

    <!-- Area summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <div v-for="card in areaCards" :key="card.key" class="rounded-xl border border-gray-100 bg-white p-3">
        <p class="text-xs font-semibold uppercase tracking-wide" :class="card.tint">{{ card.label }}</p>
        <p class="mt-1 text-lg font-bold text-gray-900">{{ formatCurrency(card.total) }}</p>
      </div>
    </div>

    <div v-if="loading && !rows.length" class="text-center py-10 text-gray-500 text-sm">Loading costs…</div>

    <div v-else-if="!rows.length" class="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center">
      <Banknote class="w-10 h-10 text-green-400 mx-auto mb-3" />
      <h4 class="text-base font-semibold text-gray-900 mb-1">No whole-farm costs yet</h4>
      <p class="text-sm text-gray-500">Record a salary or a farm-wide expense to see it here.</p>
    </div>

    <div v-else class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Area</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Account</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Details</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Method</th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="row in rows" :key="row.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ row.date }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="areaChip(row.scope)">{{ areaLabel(row.scope) }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ row.account_name }}</td>
            <td class="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{{ row.description || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm capitalize text-gray-500">{{ (row.payment_method || '—').replace('_', ' ') }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold" :class="row.type === 'expense' ? 'text-red-600' : 'text-green-600'">
              {{ formatCurrency(row.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Record Expense modal -->
    <div v-if="showExpense" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div class="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Record Farm Expense</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="showExpense = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">This expense applies to</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="area in AREAS" :key="area.value" type="button"
                class="rounded-lg border px-2 py-2 text-sm transition-colors"
                :class="expenseForm.scope === area.value ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                @click="expenseForm.scope = area.value"
              >{{ area.label }}</button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Expense account</label>
            <select v-model="expenseForm.ledger_account_id" class="w-full rounded-lg border-gray-300 text-sm">
              <option value="" disabled>Choose account</option>
              <option v-for="a in expenseAccounts" :key="a.id" :value="String(a.id)">{{ a.name }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input v-model.number="expenseForm.amount" type="number" min="0" step="0.01" inputmode="decimal" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input v-model="expenseForm.date" type="date" :max="today" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
            <select v-model="expenseForm.payment_method" class="w-full rounded-lg border-gray-300 text-sm">
              <option v-for="m in PAYMENT_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input v-model="expenseForm.description" type="text" placeholder="e.g. Whole-herd deworming day" class="w-full rounded-lg border-gray-300 text-sm">
          </div>
          <p v-if="expenseError" class="text-sm text-red-500">{{ expenseError }}</p>
          <ul v-if="expenseErrors.length" class="text-sm text-red-500 list-disc pl-5"><li v-for="e in expenseErrors" :key="e">{{ e }}</li></ul>
          <button :disabled="saving" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50" @click="submitExpense">
            {{ saving ? 'Saving…' : 'Save Expense' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Record Salary modal -->
    <div v-if="showSalary" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Record Salary</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="showSalary = false"><X class="w-5 h-5" /></button>
        </div>
        <p class="text-sm text-gray-500 mb-4">Posts to the Labour account as a whole-farm expense.</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Worker (optional)</label>
            <select v-model="salaryForm.farm_personnel_uuid" class="w-full rounded-lg border-gray-300 text-sm">
              <option value="">— Not linked —</option>
              <option v-for="p in personnel" :key="p.uuid" :value="p.uuid">{{ p.name }}{{ p.role ? ` (${p.role})` : '' }}</option>
            </select>
            <input v-if="!salaryForm.farm_personnel_uuid" v-model="salaryForm.worker_name" type="text" placeholder="Or type a name" class="mt-2 w-full rounded-lg border-gray-300 text-sm">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input v-model="salaryForm.period" type="month" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input v-model.number="salaryForm.amount" type="number" min="0" step="0.01" inputmode="decimal" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Paid on</label>
              <input v-model="salaryForm.date" type="date" :max="today" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select v-model="salaryForm.payment_method" class="w-full rounded-lg border-gray-300 text-sm">
                <option v-for="m in PAYMENT_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
          </div>
          <p v-if="salaryError" class="text-sm text-red-500">{{ salaryError }}</p>
          <ul v-if="salaryErrors.length" class="text-sm text-red-500 list-disc pl-5"><li v-for="e in salaryErrors" :key="e">{{ e }}</li></ul>
          <button :disabled="saving" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50" @click="submitSalary">
            {{ saving ? 'Saving…' : 'Record Salary' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Banknote, Plus, Users, X } from 'lucide-vue-next'

const route = useRoute()
const farmUuid = computed(() => String(route.params.uuid || ''))
const { $apiFetch } = useNuxtApp()
const { getReference } = useReferenceData()

const AREAS = [
  { value: 'general', label: 'General' },
  { value: 'livestock', label: 'All livestock' },
  { value: 'crops', label: 'All crops' }
] as const

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank', label: 'Bank' },
  { value: 'credit', label: 'Credit' }
] as const

const today = new Date().toISOString().split('T')[0] ?? ''
const thisMonth = today.slice(0, 7)

interface LedgerAccountOption { id: number, name: string, type: string }
interface PersonnelOption { uuid: string, name: string, role?: string | null }

const resource = useOfflineEntity<any>('transaction', { model: 'farm', parentUuid: farmUuid.value })
const loading = resource.loading

const expenseAccounts = ref<LedgerAccountOption[]>([])
const personnel = ref<PersonnelOption[]>([])

const saving = ref(false)
const showExpense = ref(false)
const showSalary = ref(false)
const expenseError = ref<string | null>(null)
const expenseErrors = ref<string[]>([])
const salaryError = ref<string | null>(null)
const salaryErrors = ref<string[]>([])

const expenseForm = ref({ scope: 'general', ledger_account_id: '', amount: null as number | null, date: today, payment_method: 'cash', description: '' })
const salaryForm = ref({ farm_personnel_uuid: '', worker_name: '', period: thisMonth, amount: null as number | null, date: today, payment_method: 'cash' })

const toNum = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

// One display row per transaction, from its primary ledger entry.
const rows = computed(() =>
  resource.items.value.map((t: any) => {
    const entry = (t.ledger_entries ?? t.entries ?? [])[0] ?? {}
    const account = entry.ledger_account ?? entry.ledgerAccount ?? null
    return {
      id: t.uuid ?? t.id,
      date: t.date ?? '',
      scope: t.scope ?? 'general',
      type: account?.type ?? 'expense',
      account_name: account?.name ?? '—',
      description: t.description ?? null,
      payment_method: t.payment_method ?? null,
      amount: toNum(entry.amount)
    }
  })
)

const areaCards = computed(() => {
  const totals: Record<string, number> = { all: 0, general: 0, livestock: 0, crops: 0 }
  for (const r of rows.value) {
    if (r.type !== 'expense') continue
    totals.all += r.amount
    totals[r.scope] = (totals[r.scope] ?? 0) + r.amount
  }
  return [
    { key: 'all', label: 'Total', total: totals.all, tint: 'text-gray-600' },
    { key: 'general', label: 'General', total: totals.general, tint: 'text-slate-600' },
    { key: 'livestock', label: 'Livestock', total: totals.livestock, tint: 'text-amber-600' },
    { key: 'crops', label: 'Crops', total: totals.crops, tint: 'text-emerald-600' }
  ]
})

const areaLabel = (scope?: string | null) => AREAS.find(a => a.value === scope)?.label ?? 'General'
const areaChip = (scope?: string | null) => scope === 'livestock'
  ? 'bg-amber-100 text-amber-700'
  : scope === 'crops' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(toNum(value))

const openExpense = () => {
  expenseForm.value = { scope: 'general', ledger_account_id: '', amount: null, date: today, payment_method: 'cash', description: '' }
  expenseError.value = null; expenseErrors.value = []
  showExpense.value = true
}
const openSalary = () => {
  salaryForm.value = { farm_personnel_uuid: '', worker_name: '', period: thisMonth, amount: null, date: today, payment_method: 'cash' }
  salaryError.value = null; salaryErrors.value = []
  showSalary.value = true
}

const submitExpense = async () => {
  if (!expenseForm.value.ledger_account_id || !expenseForm.value.amount) {
    expenseError.value = 'Choose an account and enter an amount.'
    return
  }
  saving.value = true; expenseError.value = null; expenseErrors.value = []
  const account = expenseAccounts.value.find(a => String(a.id) === expenseForm.value.ledger_account_id)
  const payload = {
    date: expenseForm.value.date || today,
    payment_method: expenseForm.value.payment_method,
    description: expenseForm.value.description || null,
    reference_number: null,
    transaction_for: 'farm',
    scope: expenseForm.value.scope,
    type: 'expense',
    transaction_uuid: farmUuid.value,
    entries: [{ ledger_account_id: Number(expenseForm.value.ledger_account_id), amount: Number(expenseForm.value.amount), quantity: null, unit_cost: null }]
  }
  const display = {
    ...payload,
    ledger_entries: [{ amount: Number(expenseForm.value.amount), ledger_account: account ? { name: account.name, type: account.type } : null }]
  }
  try {
    const result = await resource.create(payload, display)
    if (!result.ok) {
      expenseErrors.value = [...new Set(Object.values(result.errors).flat() as string[])]
      expenseError.value = result.message || 'Failed to save expense'
      return
    }
    showExpense.value = false
  } catch (err: any) {
    expenseError.value = err?.data?.message || 'Failed to save expense'
  } finally {
    saving.value = false
  }
}

const submitSalary = async () => {
  if (!salaryForm.value.amount) { salaryError.value = 'Enter the amount paid.'; return }
  saving.value = true; salaryError.value = null; salaryErrors.value = []
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch('/api/v1/farms/farm/salaries', {
      method: 'POST',
      body: {
        farm_uuid: farmUuid.value,
        farm_personnel_uuid: salaryForm.value.farm_personnel_uuid || null,
        worker_name: salaryForm.value.farm_personnel_uuid ? null : (salaryForm.value.worker_name || null),
        period: salaryForm.value.period || null,
        amount: Number(salaryForm.value.amount),
        payment_method: salaryForm.value.payment_method,
        date: salaryForm.value.date || today
      }
    })
    await resource.fetch()
    showSalary.value = false
  } catch (err: any) {
    const data = err?.data ?? err?.response?._data
    if (data?.errors) salaryErrors.value = [...new Set(Object.values<any>(data.errors).flat())]
    salaryError.value = data?.message || 'Failed to record salary'
  } finally {
    saving.value = false
  }
}

const fetchAccounts = async () => {
  try {
    const { data } = await getReference<LedgerAccountOption>('ledger_accounts')
    expenseAccounts.value = (data ?? []).filter(a => a.type === 'expense')
  } catch (err) { console.error('Failed to load accounts:', err) }
}
const fetchPersonnel = async () => {
  try {
    const { data } = await getReference<PersonnelOption>('personnels')
    personnel.value = data ?? []
  } catch (err) { console.error('Failed to load personnel:', err) }
}

onMounted(() => {
  resource.fetch()
  fetchAccounts()
  fetchPersonnel()
})
</script>
