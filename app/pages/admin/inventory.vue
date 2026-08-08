<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Farm Inputs</h1>
        <p class="text-sm text-gray-500 mt-1">Dip, drugs, vaccines and feed bought in bulk — track stock and what each use cost.</p>
      </div>
      <!-- Recording a purchase posts an expense, so it stays with owners
           and managers; staff can still draw stock down with "Use". -->
      <button
        v-if="canViewFinances"
        class="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
        @click="openAdd"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Input
      </button>
    </div>

    <!-- Offline note -->
    <div v-if="inputsResource.fromCache.value" class="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
      <WifiOff class="w-4 h-4 shrink-0" />
      You're offline — showing inputs saved on this phone. New purchases will send when you have network.
    </div>

    <!-- Filters -->
    <div v-if="inputs.length || categoryFilter || stockFilter" class="mb-4 flex flex-wrap gap-3">
      <select v-model="categoryFilter" class="rounded-lg border-gray-300 text-sm">
        <option value="">All categories</option>
        <option v-for="c in INPUT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
      <label class="inline-flex items-center gap-2 text-sm text-gray-700">
        <input v-model="stockFilter" type="checkbox" class="rounded border-gray-300 text-green-600 focus:ring-green-500">
        In stock only
      </label>
    </div>

    <!-- Loading -->
    <div v-if="inputsResource.loading.value && !inputs.length" class="text-center py-10 text-gray-500 text-sm">Loading inputs…</div>

    <!-- Empty -->
    <div v-else-if="!filteredInputs.length" class="bg-white rounded-lg shadow p-10 text-center">
      <Boxes class="w-10 h-10 text-green-400 mx-auto mb-3" />
      <h2 class="text-lg font-semibold text-gray-900 mb-1">No inputs yet</h2>
      <p class="text-sm text-gray-500 mb-4">Record a bulk purchase — a tin of dip, a bag of feed — then log each time you use it.</p>
      <button v-if="canViewFinances" class="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg" @click="openAdd">
        <Plus class="w-4 h-4 mr-2" />
        Add Input
      </button>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="input in filteredInputs"
        :key="input.uuid"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-semibold text-gray-900">{{ input.name }}</span>
              <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium capitalize">{{ inputsResource.categoryLabel(input.category) }}</span>
              <span v-if="input.is_depleted" class="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium">Used up</span>
              <span v-if="input.synced === false" class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">Saved on phone</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Bought {{ input.purchase_date_human ?? input.purchase_date ?? '—' }}
              <template v-if="input.supplier"> · {{ input.supplier }}</template>
              <template v-if="canViewFinances">
                · {{ formatCurrency(input.total_cost) }} for {{ fmtQty(input.quantity) }} {{ input.unit }}
                ({{ formatCurrency(input.unit_cost) }}/{{ input.unit }})
              </template>
              <template v-else> · {{ fmtQty(input.quantity) }} {{ input.unit }} bought</template>
            </p>
            <!-- Stock bar -->
            <div class="mt-2">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-medium text-gray-700">{{ fmtQty(input.quantity_remaining) }} {{ input.unit }} left</span>
                <span v-if="input.applications_remaining != null" class="text-gray-500">≈ {{ input.applications_remaining }} more use(s)</span>
              </div>
              <div class="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div class="h-full rounded-full" :class="stockBarClass(input)" :style="{ width: stockPct(input) + '%' }" />
              </div>
            </div>
            <p v-if="input.sync_error" class="text-xs text-red-500 mt-1">{{ input.sync_error }}</p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              :disabled="input.is_depleted"
              class="inline-flex items-center px-3 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="openApply(input)"
            >
              <MinusCircle class="w-4 h-4 mr-1.5" />
              Use
            </button>
            <button v-if="canViewFinances" class="p-2 text-gray-400 hover:text-gray-700" title="Edit" @click="inputsResource.openEditModal(input)"><Pencil class="w-4 h-4" /></button>
            <button v-if="canViewFinances" class="p-2 text-gray-400 hover:text-red-500" title="Delete" @click="confirmDelete(input)"><Trash2 class="w-4 h-4" /></button>
            <button
              v-if="input.applications_count"
              class="p-2 text-gray-400 hover:text-gray-700"
              :title="expanded === input.uuid ? 'Hide history' : 'Show history'"
              @click="expanded = expanded === input.uuid ? null : (input.uuid ?? null)"
            >
              <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expanded === input.uuid }" />
            </button>
          </div>
        </div>

        <!-- Applications history -->
        <div v-if="expanded === input.uuid && input.applications?.length" class="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Usage history</p>
          <div v-for="app in input.applications" :key="app.uuid" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg bg-white px-3 py-2 border border-gray-100">
            <div class="min-w-0">
              <p class="text-sm text-gray-900">
                {{ fmtQty(app.quantity_used) }} {{ input.unit }}<template v-if="canViewFinances"> · {{ formatCurrency(app.total_cost) }}</template>
                <span class="text-gray-400">· {{ inputsResource.basisLabel(app.allocation_basis) }}</span>
              </p>
              <p class="text-xs text-gray-500">
                {{ app.date_human ?? app.date }} ·
                {{ (app.targets ?? []).map(t => t.name || '—').join(', ') || 'no targets' }}
              </p>
            </div>
            <button class="text-xs font-medium text-red-500 hover:text-red-600 shrink-0" @click="reverse(app.uuid!)">Reverse</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit modal -->
    <div v-if="inputsResource.showModal.value" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div class="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ inputsResource.editing.value ? 'Edit Input' : 'Add Input' }}</h2>
          <button class="text-gray-400 hover:text-gray-600" @click="inputsResource.closeModal()"><X class="w-5 h-5" /></button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text" placeholder="e.g. Triatix dip" class="w-full rounded-lg border-gray-300 text-sm">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select v-model="form.category" class="w-full rounded-lg border-gray-300 text-sm">
                <option v-for="c in INPUT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Farm</label>
              <select v-model="form.farm_uuid" class="w-full rounded-lg border-gray-300 text-sm">
                <option value="" disabled>Choose farm</option>
                <option v-for="f in farms" :key="f.uuid" :value="f.uuid">{{ f.name }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantity bought</label>
              <input v-model.number="form.quantity" type="number" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 500" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input v-model="form.unit" type="text" maxlength="20" placeholder="ml, kg, dose…" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Total cost</label>
              <input v-model.number="form.total_cost" type="number" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 3500" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Purchase date</label>
              <input v-model="form.purchase_date" type="date" :max="today" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
          </div>
          <p v-if="form.quantity && form.total_cost" class="text-xs text-gray-500">
            That's <strong>{{ formatCurrency(Number(form.total_cost) / Number(form.quantity)) }}</strong> per {{ form.unit || 'unit' }}.
            <span v-if="!inputsResource.editing.value">Posts one expense to the ledger now.</span>
          </p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Supplier (optional)</label>
            <input v-model="form.supplier" type="text" placeholder="e.g. Agrovet Eldoret" class="w-full rounded-lg border-gray-300 text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea v-model="form.notes" rows="2" class="w-full rounded-lg border-gray-300 text-sm" />
          </div>
          <p v-if="inputsResource.submitError.value" class="text-sm text-red-500">{{ inputsResource.submitError.value }}</p>
          <ul v-if="inputsResource.errorList.value.length" class="text-sm text-red-500 list-disc pl-5">
            <li v-for="error in inputsResource.errorList.value" :key="error">{{ error }}</li>
          </ul>
          <button
            :disabled="inputsResource.submitting.value"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50"
            @click="inputsResource.saveInput"
          >
            {{ inputsResource.submitting.value ? 'Saving…' : (inputsResource.editing.value ? 'Save Changes' : 'Save Input') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Use / apply modal -->
    <div v-if="inputsResource.showApplyModal.value" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div class="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-lg font-semibold text-gray-900">Use {{ inputsResource.applyTarget.value?.name }}</h2>
          <button class="text-gray-400 hover:text-gray-600" @click="inputsResource.closeApplyModal()"><X class="w-5 h-5" /></button>
        </div>
        <p class="text-sm text-gray-500 mb-4">
          {{ fmtQty(inputsResource.applyTarget.value?.quantity_remaining) }} {{ inputsResource.applyTarget.value?.unit }} in stock.
        </p>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date used</label>
              <input v-model="applyForm.date" type="date" :max="today" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantity used ({{ inputsResource.applyTarget.value?.unit }})</label>
              <input v-model.number="applyForm.quantity_used" type="number" min="0" step="0.01" inputmode="decimal" class="w-full rounded-lg border-gray-300 text-sm">
            </div>
          </div>
          <p v-if="canViewFinances && applyForm.quantity_used && inputsResource.applyTarget.value?.unit_cost" class="text-xs text-gray-500">
            Cost of this use: <strong>{{ formatCurrency(Number(applyForm.quantity_used) * Number(inputsResource.applyTarget.value.unit_cost)) }}</strong>
          </p>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">How to split the cost</label>
            <select v-model="applyForm.allocation_basis" class="w-full rounded-lg border-gray-300 text-sm">
              <option v-for="b in ALLOCATION_BASES" :key="b.value" :value="b.value">{{ b.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Which animals/groups did this cover?</label>
            <div v-if="targetsLoading" class="text-sm text-gray-500 py-2">Loading animals…</div>
            <div v-else-if="!targetOptions.length" class="text-sm text-gray-500 py-2">No animals or groups found.</div>
            <div v-else class="max-h-56 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              <label v-for="t in targetOptions" :key="t.uuid" class="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50">
                <input v-model="applyForm.targetUuids" type="checkbox" :value="t.uuid" class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                <span class="flex-1 text-gray-800">{{ t.label }}</span>
                <input
                  v-if="applyForm.allocation_basis === 'manual' && applyForm.targetUuids.includes(t.uuid)"
                  v-model.number="applyForm.manualCosts[t.uuid]"
                  type="number" min="0" step="0.01" inputmode="decimal"
                  placeholder="share"
                  class="w-24 rounded-md border-gray-300 text-xs"
                >
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Details (optional)</label>
            <input v-model="applyForm.details" type="text" placeholder="e.g. Routine weekly spray" class="w-full rounded-lg border-gray-300 text-sm">
          </div>

          <p v-if="!isOnline" class="text-sm text-amber-600">Recording usage needs internet — it updates stock and costs.</p>
          <p v-if="inputsResource.applyError.value" class="text-sm text-red-500">{{ inputsResource.applyError.value }}</p>
          <ul v-if="inputsResource.applyErrorList.value.length" class="text-sm text-red-500 list-disc pl-5">
            <li v-for="error in inputsResource.applyErrorList.value" :key="error">{{ error }}</li>
          </ul>
          <button
            :disabled="inputsResource.applying.value || !isOnline"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50"
            @click="submitApply"
          >
            {{ inputsResource.applying.value ? 'Saving…' : 'Record Usage' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white w-full max-w-sm rounded-2xl p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Delete input?</h2>
        <p class="text-sm text-gray-500 mb-5">Remove <strong>{{ deleteTarget.name }}</strong>? Inputs already used can't be deleted — reverse their usage first.</p>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" @click="deleteTarget = null">Cancel</button>
          <button class="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600" @click="doDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Boxes, ChevronDown, MinusCircle, Pencil, Plus, Trash2, WifiOff, X } from 'lucide-vue-next'
import { INPUT_CATEGORIES, ALLOCATION_BASES, type FarmInputRecord } from '../../composables/useFarmInputs'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

useHead({ title: 'Farm Inputs - FarmManage Pro Admin' })

const { getReference } = useReferenceData()
const { isOnline } = useOffline()
// Staff can see and use stock — they need levels to record usage — but the
// purchase costs stay with owners and managers.
const authStore = useAuthStore()
const canViewFinances = computed(() => authStore.canViewFinances)

const inputsResource = useFarmInputs()
const inputs = inputsResource.inputs
const form = inputsResource.inputForm
const applyForm = inputsResource.applyForm

const today = new Date().toISOString().split('T')[0] ?? ''

const categoryFilter = ref('')
const stockFilter = ref(false)
const expanded = ref<string | null>(null)
const deleteTarget = ref<FarmInputRecord | null>(null)

const filteredInputs = computed(() =>
  inputs.value.filter(i =>
    (!categoryFilter.value || i.category === categoryFilter.value)
    && (!stockFilter.value || !i.is_depleted)
  )
)

// ── Farms (for the add form) ─────────────────────────────────────────────
interface FarmOption { uuid: string, name: string }
const farms = ref<FarmOption[]>([])

const fetchFarms = async () => {
  try {
    const { data } = await getReference<any>('farms_list')
    farms.value = (data ?? []).map((f: any) => ({ uuid: f.uuid, name: f.name }))
  } catch (err) {
    console.error('Failed to load farms:', err)
  }
}

const openAdd = () => inputsResource.openModal(farms.value.length === 1 ? farms.value[0]!.uuid : '')

// ── Apply targets (animals + groups) ─────────────────────────────────────
interface TargetOption { uuid: string, type: 'animal' | 'animal_group', label: string }
const targetOptions = ref<TargetOption[]>([])
const targetsLoading = ref(false)

const fetchTargets = async () => {
  if (targetOptions.value.length) return
  targetsLoading.value = true
  try {
    const { data } = await getReference<any>('livestock_list')
    targetOptions.value = (data ?? []).map((a: any) => {
      const isGroup = a.tracking_type === 'group'
      const name = (isGroup ? a.group_name : a.name) || a.name || 'Unnamed'
      return {
        uuid: a.uuid,
        type: isGroup ? 'animal_group' : 'animal',
        label: isGroup ? `${name} (group of ${a.count ?? '?'})` : name
      }
    })
  } catch (err) {
    console.error('Failed to load animals:', err)
  } finally {
    targetsLoading.value = false
  }
}

const openApply = (input: FarmInputRecord) => {
  inputsResource.openApplyModal(input)
  fetchTargets()
}

const submitApply = () => inputsResource.saveApplication(
  targetOptions.value.map(t => ({ uuid: t.uuid, type: t.type }))
)

// ── Delete ───────────────────────────────────────────────────────────────
const confirmDelete = (input: FarmInputRecord) => { deleteTarget.value = input }
const doDelete = async () => {
  if (deleteTarget.value?.uuid) await inputsResource.removeInput(deleteTarget.value.uuid)
  deleteTarget.value = null
}

const reverse = async (uuid: string) => {
  await inputsResource.reverseApplication(uuid)
}

// ── Display helpers ──────────────────────────────────────────────────────
const formatCurrency = (value?: number | null) => {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)
}
const fmtQty = (value?: number | null) => {
  const n = Number(value ?? 0)
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
}
const stockPct = (input: FarmInputRecord) => {
  const total = Number(input.quantity ?? 0)
  const left = Number(input.quantity_remaining ?? 0)
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((left / total) * 100)))
}
const stockBarClass = (input: FarmInputRecord) => {
  const pct = stockPct(input)
  if (pct <= 0) return 'bg-red-400'
  if (pct <= 25) return 'bg-amber-400'
  return 'bg-green-500'
}

onMounted(() => {
  fetchFarms()
  inputsResource.fetchInputs()
})
</script>
