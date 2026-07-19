// Sales — offline-first via useOfflineEntity.
//
// A sale is one farmer-facing "I sold something" record: a single product
// line (quantity × price or a straight total), the payment method, and an
// optional buyer. The backend posts the double-entry ledger income; the
// client uuid makes offline replays idempotent. Payments on credit sales
// and voiding are online-only (they validate against server balances).
import { db } from '../utils/db'

export interface SaleBuyer {
  uuid?: string
  name?: string | null
  phone?: string | null
}

export interface SaleItemRecord {
  uuid?: string
  category?: string
  product?: string
  quantity?: number
  unit?: string | null
  unit_price?: number | null
  line_total?: number
  sellable_type?: string | null
  sellable_uuid?: string | null
}

export interface SalePaymentRecord {
  uuid?: string
  date?: string
  amount?: number
  payment_method?: string
}

export interface SaleRecord {
  uuid?: string
  date?: string
  payment_method?: string
  amount_total?: number
  amount_paid?: number
  balance_due?: number
  status?: string
  notes?: string | null
  buyer?: SaleBuyer | null
  items?: SaleItemRecord[]
  payments?: SalePaymentRecord[]
  created_at?: string
  synced?: boolean
  sync_error?: string | null
}

export interface SaleContext {
  category?: string
  product?: string
  unit?: string
  sellableType?: string
  sellableUuid?: string
  sellableLabel?: string
}

export const SALE_CATEGORIES = [
  { value: 'animal_product', label: 'Milk & Eggs', defaultUnit: 'litres', products: ['Milk', 'Eggs'] },
  { value: 'bee_product', label: 'Honey & Bee Products', defaultUnit: 'kg', products: ['Honey', 'Comb honey', 'Beeswax', 'Propolis', 'Royal jelly', 'Pollen'] },
  { value: 'animal', label: 'Animals', defaultUnit: 'head', products: [] },
  { value: 'crop', label: 'Crops', defaultUnit: 'bags', products: [] },
  { value: 'other', label: 'Other', defaultUnit: 'items', products: [] }
] as const

export const SALE_PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'M-Pesa / Mobile' },
  { value: 'bank', label: 'Bank' },
  { value: 'credit', label: 'Paid later' }
] as const

export const useSales = () => {
  const { $apiFetch } = useNuxtApp()
  const resource = useOfflineEntity<SaleRecord>('sale')
  const { getReference } = useReferenceData()

  const sales = resource.items
  const loading = resource.loading
  const loadError = resource.loadError

  const fetchSales = () => resource.fetch()

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  // ── Period totals, computed client-side so they stay right offline ──────
  const activeSales = computed(() => sales.value.filter(s => s.status !== 'void'))

  const totalsFor = (since: string) =>
    activeSales.value
      .filter(s => (s.date ?? '') >= since)
      .reduce((sum, s) => sum + (s.amount_total ?? 0), 0)

  const daysAgo = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0] ?? ''
  }

  const totalToday = computed(() => totalsFor(today()))
  const totalWeek = computed(() => totalsFor(daysAgo(6)))
  const totalMonth = computed(() => totalsFor(daysAgo(29)))

  const owedSales = computed(() =>
    activeSales.value.filter(s => (s.status === 'owed' || s.status === 'partial') && (s.balance_due ?? 0) > 0)
  )

  const owedTotal = computed(() =>
    owedSales.value.reduce((sum, s) => sum + (s.balance_due ?? 0), 0)
  )

  const formatCurrency = (value: number | null | undefined) =>
    `KES ${Number(value ?? 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`

  const statusLabel = (status: string | undefined) => {
    const map: Record<string, string> = { paid: 'Paid', partial: 'Partly paid', owed: 'Owed to you', void: 'Voided' }
    return map[status ?? ''] ?? status ?? ''
  }

  const statusBadgeClass = (status: string | undefined) => {
    const base = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold'
    if (status === 'paid') return `${base} bg-green-100 text-green-800`
    if (status === 'partial') return `${base} bg-amber-100 text-amber-800`
    if (status === 'owed') return `${base} bg-red-100 text-red-800`
    if (status === 'void') return `${base} bg-gray-100 text-gray-500`
    return `${base} bg-gray-100 text-gray-800`
  }

  const itemsSummary = (sale: SaleRecord) =>
    (sale.items ?? [])
      .map(i => `${i.quantity ?? ''} ${i.unit ?? ''} ${i.product ?? ''}`.trim())
      .join(', ') || '—'

  // ── Online-only follow-ups ───────────────────────────────────────────────
  const recordPayment = async (saleUuid: string, payment: { date: string, amount: number, payment_method: string }) => {
    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<any>(`/api/v1/farms/farm/sales/${saleUuid}/payments`, {
      method: 'POST',
      body: { ...payment, uuid: crypto.randomUUID() }
    })
    const updated: SaleRecord | undefined = response?.data?.sale
    if (updated?.uuid) {
      const idx = sales.value.findIndex(s => s.uuid === updated.uuid)
      if (idx !== -1) sales.value[idx] = { ...updated, synced: true }
      await db.putRecord('sale', updated.uuid, '', updated, true)
    }
    return updated
  }

  const voidSale = async (saleUuid: string) => {
    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<any>(`/api/v1/farms/farm/sales/${saleUuid}/void`, { method: 'POST' })
    const updated: SaleRecord | undefined = response?.data
    if (updated?.uuid) {
      const idx = sales.value.findIndex(s => s.uuid === updated.uuid)
      if (idx !== -1) sales.value[idx] = { ...updated, synced: true }
      await db.putRecord('sale', updated.uuid, '', updated, true)
    }
    return updated
  }

  const fetchBuyers = async () => {
    try {
      const { data } = await getReference<SaleBuyer>('buyers')
      return data
    } catch {
      return []
    }
  }

  return {
    resource,
    sales,
    loading,
    loadError,
    fetchSales,
    fetchBuyers,
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
  }
}
