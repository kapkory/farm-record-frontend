<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="close"></div>

      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-gray-200 p-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Record a Sale</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ context?.sellableLabel ? `Selling from ${context.sellableLabel}` : 'What did you sell, how much, and how were you paid?' }}
              </p>
            </div>
            <button type="button" @click="close" class="text-gray-400 transition-colors hover:text-gray-600">
              <X class="h-5 w-5" />
            </button>
          </div>

          <form @submit.prevent="save" class="space-y-4 p-5">
            <!-- Farm (only shown when the farmer has more than one) -->
            <div v-if="farms.length > 1">
              <Label class="mb-1 block text-sm font-medium text-gray-700">Farm</Label>
              <select v-model="form.farm_uuid" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
                <option v-for="farm in farms" :key="farm.uuid" :value="farm.uuid">{{ farm.name }}</option>
              </select>
            </div>

            <!-- What was sold -->
            <div>
              <Label class="mb-1 block text-sm font-medium text-gray-700">What did you sell?</Label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cat in categories"
                  :key="cat.value"
                  type="button"
                  @click="selectCategory(cat.value)"
                  :class="['rounded-full border px-3 py-1.5 text-sm font-medium transition-colors', form.category === cat.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-600 hover:border-green-300']"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Product</Label>
                <Input v-model="form.product" type="text" class="w-full" list="sale-product-suggestions" placeholder="e.g. Milk, Honey, Goat, Maize" />
                <datalist id="sale-product-suggestions">
                  <option v-for="p in productSuggestions" :key="p" :value="p" />
                </datalist>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Date</Label>
                <Input v-model="form.date" type="date" class="w-full" />
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">How many / how much?</Label>
                <div class="flex gap-2">
                  <Input v-model="form.quantity" type="number" step="0.01" min="0.01" class="w-full" placeholder="Quantity" />
                  <Input v-model="form.unit" type="text" class="w-28" placeholder="Unit" />
                </div>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Price</Label>
                <div class="flex items-center gap-2">
                  <Input v-model="form.unit_price" type="number" step="0.01" min="0" class="w-full" placeholder="Per unit" @input="priceEdited = 'unit'" />
                  <span class="text-xs text-gray-400">or</span>
                  <Input v-model="form.line_total" type="number" step="0.01" min="0" class="w-full" placeholder="Total" @input="priceEdited = 'total'" />
                </div>
                <p v-if="computedTotal" class="mt-1 text-xs text-gray-500">Total: <span class="font-semibold text-gray-800">{{ formatCurrency(computedTotal) }}</span></p>
              </div>
            </div>

            <!-- Link to a recorded collection (optional) -->
            <div v-if="productionOptions.length">
              <Label class="mb-1 block text-sm font-medium text-gray-700">From which collection? <span class="font-normal text-gray-400">(optional)</span></Label>
              <select v-model="linkedProductionUuid" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Not from a recorded collection</option>
                <option v-for="p in productionOptions" :key="p.uuid" :value="p.uuid">
                  {{ p.date }} — {{ p.quantity }} {{ p.unit }} {{ p.name }}{{ p.source_label ? ` · ${p.source_label}` : '' }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-400">Linking helps you see what was produced but not sold.</p>
            </div>

            <!-- Payment -->
            <div>
              <Label class="mb-1 block text-sm font-medium text-gray-700">How were you paid?</Label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="method in paymentMethods"
                  :key="method.value"
                  type="button"
                  @click="form.payment_method = method.value"
                  :class="['rounded-full border px-3 py-1.5 text-sm font-medium transition-colors', form.payment_method === method.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-600 hover:border-green-300']"
                >
                  {{ method.label }}
                </button>
              </div>
              <p v-if="form.payment_method === 'credit'" class="mt-1 text-xs text-amber-600">This sale will be tracked under "Owed to you" until the buyer pays.</p>
            </div>

            <!-- Buyer (optional) -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Buyer <span class="font-normal text-gray-400">(optional)</span></Label>
                <select v-model="form.buyer_uuid" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">No buyer recorded</option>
                  <option v-for="buyer in buyers" :key="buyer.uuid" :value="buyer.uuid">{{ buyer.name }}{{ buyer.phone ? ` (${buyer.phone})` : '' }}</option>
                  <option value="__new__">+ New buyer…</option>
                </select>
              </div>

              <div v-if="form.buyer_uuid === '__new__'" class="grid grid-cols-2 gap-2">
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Buyer name</Label>
                  <Input v-model="form.buyer_name" type="text" class="w-full" placeholder="Name" />
                </div>
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Phone</Label>
                  <Input v-model="form.buyer_phone" type="text" class="w-full" placeholder="07…" />
                </div>
              </div>
            </div>

            <div>
              <Label class="mb-1 block text-sm font-medium text-gray-700">Notes <span class="font-normal text-gray-400">(optional)</span></Label>
              <textarea v-model="form.notes" rows="2" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Anything worth remembering about this sale"></textarea>
            </div>

            <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p class="font-medium">Please fix the following before saving:</p>
              <p class="mt-1">{{ submitError }}</p>
              <ul v-if="errorList.length" class="mt-2 list-disc pl-5">
                <li v-for="item in errorList" :key="item">{{ item }}</li>
              </ul>
            </div>

            <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button type="button" @click="close" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <Button type="submit" :disabled="submitting || !canSave">
                <span v-if="submitting">Saving...</span>
                <span v-else>Save Sale{{ computedTotal ? ` — ${formatCurrency(computedTotal)}` : '' }}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import { SALE_CATEGORIES, SALE_PAYMENT_METHODS, type SaleContext } from '../../composables/useSales'

const props = defineProps<{
  open: boolean
  context?: SaleContext | null
}>()

const emit = defineEmits<{ close: [], saved: [] }>()

const { resource, fetchBuyers, formatCurrency } = useSales()
const { getReference } = useReferenceData()

const categories = SALE_CATEGORIES
const paymentMethods = SALE_PAYMENT_METHODS

interface FarmOption { uuid: string, name?: string | null }

interface ProductionOption {
  uuid: string
  name?: string | null
  date?: string | null
  quantity?: number | null
  unit?: string | null
  source_label?: string | null
}

const farms = ref<FarmOption[]>([])
const buyers = ref<Array<{ uuid?: string, name?: string | null, phone?: string | null }>>([])
const productionOptions = ref<ProductionOption[]>([])
const linkedProductionUuid = ref('')
const submitting = ref(false)
const submitError = ref<string | null>(null)
const errorList = ref<string[]>([])
const priceEdited = ref<'unit' | 'total'>('unit')

const createDefaultForm = () => ({
  farm_uuid: '',
  date: new Date().toISOString().split('T')[0] ?? '',
  category: 'animal_product',
  product: '',
  quantity: '',
  unit: 'litres',
  unit_price: '',
  line_total: '',
  payment_method: 'cash',
  buyer_uuid: '',
  buyer_name: '',
  buyer_phone: '',
  notes: ''
})

const form = ref(createDefaultForm())

const productSuggestions = computed(() =>
  categories.find(c => c.value === form.value.category)?.products ?? []
)

const computedTotal = computed(() => {
  const qty = Number(form.value.quantity)
  if (priceEdited.value === 'total' && form.value.line_total !== '') return Number(form.value.line_total)
  if (form.value.unit_price !== '' && qty > 0) return Math.round(qty * Number(form.value.unit_price) * 100) / 100
  if (form.value.line_total !== '') return Number(form.value.line_total)
  return 0
})

const canSave = computed(() =>
  !!form.value.farm_uuid
  && !!form.value.product
  && Number(form.value.quantity) > 0
  && computedTotal.value > 0
)

const selectCategory = (value: string) => {
  form.value.category = value
  const cat = categories.find(c => c.value === value)
  if (cat) form.value.unit = cat.defaultUnit
}

const applyContext = () => {
  const ctx = props.context
  if (!ctx) return
  if (ctx.category) selectCategory(ctx.category)
  if (ctx.product) form.value.product = ctx.product
  if (ctx.unit) form.value.unit = ctx.unit
}

// Recent unlinked collections matching the product being sold ("honey"
// offers honey harvests, never egg collections). Animals themselves aren't
// collections, and offline there's nothing to fetch — hide the picker.
let productionFetchTimer: ReturnType<typeof setTimeout> | null = null

const fetchProductionOptions = async () => {
  linkedProductionUuid.value = ''
  if (form.value.category === 'animal' || !form.value.product) {
    productionOptions.value = []
    return
  }
  try {
    const { $apiFetch } = useNuxtApp()
    const params = new URLSearchParams({ product: form.value.product })
    if (props.context?.sellableType && props.context?.sellableUuid) {
      params.set('sellable_type', props.context.sellableType)
      params.set('sellable_uuid', props.context.sellableUuid)
    }
    const response = await $apiFetch<any>(`/api/v1/farms/farm/productions/unlinked?${params}`)
    productionOptions.value = (response?.data ?? []).filter((p: ProductionOption) => !!p.uuid)
  } catch {
    productionOptions.value = []
  }
}

watch(() => [form.value.product, form.value.category], () => {
  if (!props.open) return
  if (productionFetchTimer) clearTimeout(productionFetchTimer)
  productionFetchTimer = setTimeout(fetchProductionOptions, 400)
})

const loadOptions = async () => {
  try {
    const { data } = await getReference<FarmOption & Record<string, any>>('farms_list')
    farms.value = data.filter(f => !!f.uuid)
    if (!form.value.farm_uuid && farms.value.length) {
      form.value.farm_uuid = farms.value[0]?.uuid ?? ''
    }
  } catch {
    farms.value = []
  }
  buyers.value = await fetchBuyers()
}

watch(() => props.open, (open) => {
  if (open) {
    form.value = createDefaultForm()
    submitError.value = null
    errorList.value = []
    priceEdited.value = 'unit'
    productionOptions.value = []
    linkedProductionUuid.value = ''
    applyContext()
    loadOptions()
    fetchProductionOptions()
  }
})

const close = () => emit('close')

const save = async () => {
  if (!canSave.value) return
  submitting.value = true
  submitError.value = null
  errorList.value = []

  const quantity = Number(form.value.quantity)
  const unitPrice = form.value.unit_price !== '' ? Number(form.value.unit_price) : null
  const lineTotal = computedTotal.value
  const isCredit = form.value.payment_method === 'credit'

  const item = {
    category: form.value.category,
    product: form.value.product,
    quantity,
    unit: form.value.unit || null,
    unit_price: priceEdited.value === 'total' ? null : unitPrice,
    line_total: lineTotal,
    sellable_type: props.context?.sellableType ?? null,
    sellable_uuid: props.context?.sellableUuid ?? null,
    production_uuid: linkedProductionUuid.value || null
  }

  const payload: Record<string, any> = {
    farm_uuid: form.value.farm_uuid,
    date: form.value.date,
    payment_method: form.value.payment_method,
    notes: form.value.notes || null,
    items: [item]
  }

  if (form.value.buyer_uuid && form.value.buyer_uuid !== '__new__') {
    payload.buyer_uuid = form.value.buyer_uuid
  } else if (form.value.buyer_uuid === '__new__' && form.value.buyer_name) {
    payload.buyer = { name: form.value.buyer_name, phone: form.value.buyer_phone || null }
  }

  const selectedBuyer = buyers.value.find(b => b.uuid === form.value.buyer_uuid)
  const display = {
    date: form.value.date,
    payment_method: form.value.payment_method,
    amount_total: lineTotal,
    amount_paid: isCredit ? 0 : lineTotal,
    balance_due: isCredit ? lineTotal : 0,
    status: isCredit ? 'owed' : 'paid',
    notes: form.value.notes || null,
    buyer: payload.buyer ?? (selectedBuyer ? { name: selectedBuyer.name, phone: selectedBuyer.phone } : null),
    items: [{ ...item, unit_price: unitPrice ?? (quantity > 0 ? Math.round((lineTotal / quantity) * 100) / 100 : null) }],
    payments: []
  }

  try {
    const result = await resource.create(payload, display)
    if (!result.ok) {
      submitError.value = result.message || 'Failed to record sale'
      errorList.value = Object.values(result.errors ?? {}).flat()
      return
    }
    emit('saved')
    emit('close')
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Failed to record sale'
  } finally {
    submitting.value = false
  }
}
</script>
