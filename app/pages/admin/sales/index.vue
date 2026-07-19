<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Sales</h1>
        <p class="text-gray-500 mt-0.5 text-sm">Everything you have sold and the money still owed to you.</p>
      </div>
      <Button type="button" @click="showSaleModal = true" class="inline-flex items-center gap-2">
        <Plus class="h-4 w-4" />
        Record Sale
      </Button>
    </div>

    <!-- Totals -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Today</p>
        <p class="mt-1 text-xl font-bold text-gray-900">{{ formatCurrency(totalToday) }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Last 7 days</p>
        <p class="mt-1 text-xl font-bold text-gray-900">{{ formatCurrency(totalWeek) }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Last 30 days</p>
        <p class="mt-1 text-xl font-bold text-gray-900">{{ formatCurrency(totalMonth) }}</p>
      </div>
      <div class="rounded-xl border p-4" :class="owedTotal > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'">
        <p class="text-xs font-semibold uppercase tracking-wide" :class="owedTotal > 0 ? 'text-red-500' : 'text-gray-400'">Owed to you</p>
        <p class="mt-1 text-xl font-bold" :class="owedTotal > 0 ? 'text-red-700' : 'text-gray-900'">{{ formatCurrency(owedTotal) }}</p>
        <p v-if="owedSales.length" class="mt-0.5 text-xs text-red-500">{{ owedSales.length }} unpaid sale{{ owedSales.length === 1 ? '' : 's' }}</p>
      </div>
    </div>

    <!-- What sells best (last 30 days) -->
    <div v-if="productBreakdown.length" class="rounded-xl border border-gray-200 bg-white p-4">
      <h2 class="text-sm font-semibold text-gray-900 mb-3">What earned the most (last 30 days)</h2>
      <div class="space-y-2">
        <div v-for="row in productBreakdown" :key="row.product" class="flex items-center gap-3">
          <span class="w-32 truncate text-sm text-gray-600 capitalize">{{ row.product }}</span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div class="h-full rounded-full bg-green-400" :style="{ width: `${row.percent}%` }"></div>
          </div>
          <span class="w-28 text-right text-sm font-medium text-gray-800">{{ formatCurrency(row.total) }}</span>
        </div>
      </div>
    </div>

    <!-- Produced vs sold (last 30 days) -->
    <div v-if="producedVsSold.length" class="rounded-xl border border-gray-200 bg-white p-4">
      <h2 class="text-sm font-semibold text-gray-900 mb-1">Produced vs sold (last 30 days)</h2>
      <p class="mb-3 text-xs text-gray-400">What was collected, what was sold, and what is still unsold.</p>
      <div class="space-y-3">
        <div v-for="row in producedVsSold" :key="row.product">
          <div class="flex items-baseline justify-between text-sm">
            <span class="font-medium capitalize text-gray-800">{{ row.product }}</span>
            <span class="text-xs text-gray-500">
              {{ row.produced }} {{ row.unit }} collected · {{ row.sold }} sold
              <span v-if="row.unsold > 0" class="font-semibold text-amber-600">· {{ row.unsold }} unsold</span>
            </span>
          </div>
          <div class="mt-1 h-2 overflow-hidden rounded-full bg-amber-100">
            <div
              class="h-full rounded-full bg-green-400"
              :style="{ width: `${row.produced > 0 ? Math.min(100, Math.round((row.sold / row.produced) * 100)) : 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales list -->
    <div class="rounded-xl border border-gray-200 bg-white">
      <div v-if="actionError" class="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">{{ actionError }}</div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading sales...</span>
      </div>

      <div v-else-if="!sales.length" class="p-12 text-center text-gray-500">
        <p class="font-medium text-gray-700">No sales recorded yet.</p>
        <p class="mt-1 text-sm">Tap "Record Sale" the next time you sell milk, honey, animals or produce.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">What was sold</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Buyer</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="sale in sales" :key="sale.uuid" class="hover:bg-gray-50" :class="{ 'opacity-50': sale.status === 'void' }">
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {{ sale.date }}
                <span v-if="sale.synced === false" class="ml-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">will sync</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 capitalize">{{ itemsSummary(sale) }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{{ sale.buyer?.name || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">{{ formatCurrency(sale.amount_total) }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="statusBadgeClass(sale.status)">{{ statusLabel(sale.status) }}</span>
                <p v-if="sale.status === 'partial'" class="mt-0.5 text-xs text-gray-500">{{ formatCurrency(sale.balance_due) }} left</p>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                <button class="font-medium text-green-600 hover:text-green-700" @click="openDetail(sale)">View</button>
                <button
                  v-if="(sale.status === 'owed' || sale.status === 'partial') && sale.synced !== false"
                  class="ml-3 font-medium text-blue-600 hover:text-blue-700"
                  @click="openPayment(sale)"
                >Record payment</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <RecordSaleModal :open="showSaleModal" @close="showSaleModal = false" @saved="fetchSales" />

    <!-- Payment modal -->
    <Teleport to="body">
      <div v-if="paymentSale" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="paymentSale = null"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900">Record payment</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ paymentSale.buyer?.name || 'The buyer' }} still owes
              <span class="font-semibold text-gray-800">{{ formatCurrency(paymentSale.balance_due) }}</span>.
            </p>

            <div class="mt-4 space-y-3">
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Amount received</Label>
                <Input v-model="paymentForm.amount" type="number" step="0.01" min="0.01" class="w-full" />
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Date</Label>
                <Input v-model="paymentForm.date" type="date" class="w-full" />
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Paid by</Label>
                <div class="flex gap-2">
                  <button
                    v-for="m in payMethods"
                    :key="m.value"
                    type="button"
                    @click="paymentForm.payment_method = m.value"
                    :class="['rounded-full border px-3 py-1.5 text-sm font-medium', paymentForm.payment_method === m.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-600']"
                  >{{ m.label }}</button>
                </div>
              </div>
              <p v-if="paymentError" class="text-sm text-red-600">{{ paymentError }}</p>
            </div>

            <div class="mt-5 flex justify-end gap-3">
              <button type="button" @click="paymentSale = null" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <Button type="button" :disabled="payingBusy || !Number(paymentForm.amount)" @click="submitPayment">
                <span v-if="payingBusy">Saving...</span>
                <span v-else>Save payment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Detail / receipt modal -->
    <Teleport to="body">
      <div v-if="detailSale" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="detailSale = null"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-md rounded-lg bg-white shadow-xl print:shadow-none" id="sale-receipt">
            <div class="border-b border-gray-200 p-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Sale receipt</h3>
                <button type="button" @click="detailSale = null" class="text-gray-400 hover:text-gray-600 print:hidden">
                  <X class="h-5 w-5" />
                </button>
              </div>
              <p class="mt-1 text-sm text-gray-500">{{ detailSale.date }} · <span :class="statusBadgeClass(detailSale.status)">{{ statusLabel(detailSale.status) }}</span></p>
            </div>

            <div class="p-4">
              <table class="w-full text-sm">
                <tbody>
                  <tr v-for="item in detailSale.items" :key="item.uuid ?? item.product" class="border-b border-gray-100">
                    <td class="py-2 capitalize text-gray-800">{{ item.product }}</td>
                    <td class="py-2 text-right text-gray-500">{{ item.quantity }} {{ item.unit }} × {{ formatCurrency(item.unit_price) }}</td>
                    <td class="py-2 text-right font-medium text-gray-900">{{ formatCurrency(item.line_total) }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="mt-3 space-y-1 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Total</span><span class="font-semibold text-gray-900">{{ formatCurrency(detailSale.amount_total) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Paid</span><span class="text-gray-800">{{ formatCurrency(detailSale.amount_paid) }}</span></div>
                <div v-if="(detailSale.balance_due ?? 0) > 0" class="flex justify-between text-red-600"><span>Still owed</span><span class="font-semibold">{{ formatCurrency(detailSale.balance_due) }}</span></div>
                <div v-if="detailSale.buyer?.name" class="flex justify-between"><span class="text-gray-500">Buyer</span><span class="text-gray-800">{{ detailSale.buyer.name }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Payment</span><span class="capitalize text-gray-800">{{ (detailSale.payment_method ?? '').replace('_', ' ') }}</span></div>
              </div>

              <div v-if="detailSale.payments?.length" class="mt-3 border-t border-gray-100 pt-2">
                <p class="text-xs font-semibold uppercase text-gray-400">Payments</p>
                <div v-for="p in detailSale.payments" :key="p.uuid" class="flex justify-between text-sm text-gray-600">
                  <span>{{ p.date }} · {{ (p.payment_method ?? '').replace('_', ' ') }}</span>
                  <span>{{ formatCurrency(p.amount) }}</span>
                </div>
              </div>

              <p v-if="detailSale.notes" class="mt-3 text-sm text-gray-500">{{ detailSale.notes }}</p>
            </div>

            <div class="flex justify-between gap-3 border-t border-gray-200 p-4 print:hidden">
              <button
                v-if="detailSale.status !== 'void' && detailSale.synced !== false && !detailSale.payments?.length"
                type="button"
                class="text-sm font-medium text-red-600 hover:text-red-700"
                :disabled="voidBusy"
                @click="submitVoid"
              >{{ voidBusy ? 'Voiding…' : 'Void this sale' }}</button>
              <span v-else></span>
              <Button type="button" @click="printReceipt">Print</Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus, X } from 'lucide-vue-next'
import type { SaleRecord } from '../../../composables/useSales'

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
})

const {
  sales,
  loading,
  fetchSales,
  totalToday,
  totalWeek,
  totalMonth,
  owedSales,
  owedTotal,
  formatCurrency,
  statusLabel,
  statusBadgeClass,
  itemsSummary,
  recordPayment,
  voidSale
} = useSales()

const showSaleModal = ref(false)
const detailSale = ref<SaleRecord | null>(null)
const paymentSale = ref<SaleRecord | null>(null)
const paymentError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const payingBusy = ref(false)
const voidBusy = ref(false)

const payMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank' }
]

const paymentForm = ref({
  amount: '',
  date: new Date().toISOString().split('T')[0] ?? '',
  payment_method: 'cash'
})

// Earnings by product over the last 30 days, for the mini report.
const productBreakdown = computed(() => {
  const cutoff = (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().split('T')[0] ?? '' })()
  const map: Record<string, number> = {}
  for (const sale of sales.value) {
    if (sale.status === 'void' || (sale.date ?? '') < cutoff) continue
    for (const item of sale.items ?? []) {
      const key = (item.product ?? 'other').toLowerCase()
      map[key] = (map[key] ?? 0) + (item.line_total ?? 0)
    }
  }
  const rows = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([product, total]) => ({ product, total, percent: 0 }))
  const max = rows[0]?.total || 1
  rows.forEach(r => { r.percent = Math.round((r.total / max) * 100) })
  return rows
})

const openDetail = (sale: SaleRecord) => { detailSale.value = sale }

const openPayment = (sale: SaleRecord) => {
  paymentError.value = null
  paymentForm.value = {
    amount: String(sale.balance_due ?? ''),
    date: new Date().toISOString().split('T')[0] ?? '',
    payment_method: 'cash'
  }
  paymentSale.value = sale
}

const submitPayment = async () => {
  if (!paymentSale.value?.uuid) return
  payingBusy.value = true
  paymentError.value = null
  try {
    await recordPayment(paymentSale.value.uuid, {
      amount: Number(paymentForm.value.amount),
      date: paymentForm.value.date,
      payment_method: paymentForm.value.payment_method
    })
    paymentSale.value = null
  } catch (err: any) {
    paymentError.value = err?.data?.errors?.amount?.[0]
      ?? err?.data?.message
      ?? 'Could not record the payment. Check your connection and try again.'
  } finally {
    payingBusy.value = false
  }
}

const submitVoid = async () => {
  if (!detailSale.value?.uuid) return
  if (!window.confirm('Void this sale? The money will be removed from your records and sold animals restored.')) return
  voidBusy.value = true
  actionError.value = null
  try {
    const updated = await voidSale(detailSale.value.uuid)
    if (updated) detailSale.value = updated
  } catch (err: any) {
    actionError.value = err?.data?.errors?.sale?.[0]
      ?? err?.data?.message
      ?? 'Could not void the sale. Check your connection and try again.'
    detailSale.value = null
  } finally {
    voidBusy.value = false
  }
}

const printReceipt = () => window.print()

// Produced vs sold — online-only report; the card hides when unavailable.
interface ProducedVsSoldRow { product: string, unit: string | null, produced: number, sold: number, unsold: number }
const producedVsSold = ref<ProducedVsSoldRow[]>([])

const fetchProducedVsSold = async () => {
  try {
    const from = (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().split('T')[0] })()
    const { $apiFetch } = useNuxtApp()
    const response = await $apiFetch<any>(`/api/v1/farms/farm/productions/summary?from=${from}`)
    producedVsSold.value = response?.data ?? []
  } catch {
    producedVsSold.value = []
  }
}

onMounted(() => {
  fetchSales()
  fetchProducedVsSold()
})
</script>
