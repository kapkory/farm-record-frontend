// Bee harvest sessions — offline-first via useOfflineEntity.
//
// One session = one create covering many hives and one or more products
// (honey plus by-products). The factory's client uuid becomes the backend's
// idempotent session id (trace_number), so an offline replay never
// duplicates productions.

export interface BeeHarvestTotal {
  product: string
  unit: string
  quantity: number
}

export interface BeeHarvestSession {
  uuid?: string
  trace_number?: string
  date?: string
  totals?: BeeHarvestTotal[]
  hive_count?: number
  hive_codes?: string[]
  hives?: Array<{
    uuid: string
    code: string | null
    products: BeeHarvestTotal[]
    next_harvest_due: string | null
  }>
  notes?: string | null
  warnings?: string[]
  synced?: boolean
  sync_error?: string | null
}

export const BEE_PRODUCTS = [
  { value: 'honey', label: 'Honey', unit: 'kg' },
  { value: 'comb_honey', label: 'Comb honey', unit: 'kg' },
  { value: 'beeswax', label: 'Beeswax', unit: 'kg' },
  { value: 'propolis', label: 'Propolis', unit: 'g' },
  { value: 'royal_jelly', label: 'Royal jelly', unit: 'g' },
  { value: 'pollen', label: 'Pollen', unit: 'g' },
  { value: 'bee_venom', label: 'Bee venom', unit: 'g' }
] as const

export interface HarvestProductLine {
  product: string
  unit: string
  /** 'even' = one bucket total split across hives; 'per_hive' = weighed per hive */
  mode: 'even' | 'per_hive'
  total: number | null
  perHive: Record<string, number | null>
}

export const useBeeHarvests = () => {
  const resource = useOfflineEntity<BeeHarvestSession>('beeHarvest')

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const newLine = (product = 'honey'): HarvestProductLine => ({
    product,
    unit: BEE_PRODUCTS.find(p => p.value === product)?.unit ?? 'kg',
    mode: 'even',
    total: null,
    perHive: {}
  })

  const sessions = resource.items
  const loading = resource.loading
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const errorList = ref<string[]>([])
  const showModal = ref(false)
  const harvestDate = ref(today())
  const harvestNotes = ref('')
  const lines = ref<HarvestProductLine[]>([newLine()])

  const resetForm = () => {
    harvestDate.value = today()
    harvestNotes.value = ''
    lines.value = [newLine()]
    submitError.value = null
    errorList.value = []
  }

  const openModal = () => {
    resetForm()
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
  }

  const addLine = () => {
    const used = lines.value.map(l => l.product)
    const next = BEE_PRODUCTS.find(p => !used.includes(p.value))
    if (next) lines.value.push(newLine(next.value))
  }

  const removeLine = (index: number) => {
    if (lines.value.length > 1) lines.value.splice(index, 1)
  }

  const onProductChange = (line: HarvestProductLine) => {
    line.unit = BEE_PRODUCTS.find(p => p.value === line.product)?.unit ?? 'kg'
  }

  const productLabel = (product?: string) =>
    BEE_PRODUCTS.find(p => p.value === product)?.label ?? (product || '—')

  const buildPayload = (selectedHiveUuids: string[]) => ({
    date: harvestDate.value || today(),
    notes: harvestNotes.value || null,
    products: lines.value.map(line => line.mode === 'even'
      ? {
          product: line.product,
          unit: line.unit,
          total_quantity: line.total,
          split: 'even',
          hive_uuids: selectedHiveUuids
        }
      : {
          product: line.product,
          unit: line.unit,
          hives: selectedHiveUuids
            .filter(uuid => Number(line.perHive[uuid]) > 0)
            .map(uuid => ({ hive_uuid: uuid, quantity: Number(line.perHive[uuid]) }))
        })
  })

  const validateForm = (selectedHiveUuids: string[]): string | null => {
    if (selectedHiveUuids.length === 0) return 'Select at least one hive first'
    for (const line of lines.value) {
      if (line.mode === 'even' && !(Number(line.total) > 0)) {
        return `Enter the total ${productLabel(line.product).toLowerCase()} quantity`
      }
      if (line.mode === 'per_hive'
        && !selectedHiveUuids.some(uuid => Number(line.perHive[uuid]) > 0)) {
        return `Enter a quantity for at least one hive (${productLabel(line.product)})`
      }
    }
    return null
  }

  const saveHarvest = async (selectedHiveUuids: string[], selectedCodes: string[] = []) => {
    submitError.value = validateForm(selectedHiveUuids)
    if (submitError.value) return false

    submitting.value = true
    errorList.value = []

    const payload = buildPayload(selectedHiveUuids)
    const display: BeeHarvestSession = {
      date: payload.date,
      notes: payload.notes,
      hive_count: selectedHiveUuids.length,
      hive_codes: selectedCodes,
      totals: lines.value.map(line => ({
        product: line.product,
        unit: line.unit,
        quantity: line.mode === 'even'
          ? Number(line.total) || 0
          : selectedHiveUuids.reduce((sum, uuid) => sum + (Number(line.perHive[uuid]) || 0), 0)
      }))
    }

    try {
      const result = await resource.create(payload, display)
      if (!result.ok) {
        errorList.value = [...new Set(Object.values(result.errors).flat())]
        submitError.value = result.message || 'Validation failed'
        return false
      }
      closeModal()
      return true
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save harvest'
      return false
    } finally {
      submitting.value = false
    }
  }

  const fetchSessions = () => resource.fetch()

  return {
    sessions,
    loading,
    submitting,
    submitError,
    errorList,
    showModal,
    harvestDate,
    harvestNotes,
    lines,
    openModal,
    closeModal,
    resetForm,
    addLine,
    removeLine,
    onProductChange,
    productLabel,
    saveHarvest,
    fetchSessions
  }
}
