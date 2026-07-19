// Animal productions (milk collections, eggs, wool…) — offline-first via
// useOfflineEntity. Production is recorded independently of sales: the
// farmer logs everything collected, whether or not it is ever sold.

export interface AnimalProductionRecord {
  uuid?: string
  name?: string | null
  date?: string | null
  quantity?: number | string | null
  unit?: string | null
  grade?: string | null
  notes?: string | null
  productionable_type?: string | null
  synced?: boolean
  sync_error?: string | null
}

export const ANIMAL_PRODUCTS = [
  { value: 'Milk', unit: 'litres' },
  { value: 'Eggs', unit: 'pieces' },
  { value: 'Wool', unit: 'kg' },
  { value: 'Manure', unit: 'bags' },
  { value: 'Other', unit: 'units' }
] as const

export const useAnimalProductions = (animalUuid: string, trackingType: 'individual' | 'group' = 'individual') => {
  const model = trackingType === 'group' ? 'animal_group' : 'animal'
  const resource = useOfflineEntity<AnimalProductionRecord>('production', {
    model,
    parentUuid: animalUuid
  })

  const productions = resource.items
  const loading = resource.loading
  const loadError = resource.loadError
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const errorList = ref<string[]>([])
  const showModal = ref(false)

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    name: 'Milk',
    quantity: '',
    unit: 'litres',
    date: today(),
    grade: '',
    notes: ''
  })

  const form = ref(createDefaultForm())

  const selectProduct = (value: string) => {
    form.value.name = value
    const preset = ANIMAL_PRODUCTS.find(p => p.value === value)
    if (preset) form.value.unit = preset.unit
  }

  // Recent collection totals per product, so the farmer sees at a glance
  // what the animal produced this week without reading the whole table.
  const weekTotals = computed(() => {
    const cutoff = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().split('T')[0] ?? '' })()
    const map: Record<string, { quantity: number, unit: string }> = {}
    for (const p of productions.value) {
      if ((p.date ?? '') < cutoff) continue
      const key = p.name ?? 'Other'
      const entry = map[key] ?? { quantity: 0, unit: p.unit ?? '' }
      entry.quantity += Number(p.quantity ?? 0)
      map[key] = entry
    }
    return Object.entries(map).map(([name, v]) => ({ name, ...v }))
  })

  const resetForm = () => {
    form.value = createDefaultForm()
    submitError.value = null
    errorList.value = []
  }

  const openModal = () => {
    resetForm()
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    submitError.value = null
    errorList.value = []
  }

  const fetchProductions = () => resource.fetch()

  const saveProduction = async () => {
    submitting.value = true
    submitError.value = null
    errorList.value = []

    const payload = {
      productionable_type: model,
      productionable_uuid: animalUuid,
      name: form.value.name || 'Milk',
      date: form.value.date,
      quantity: Number(form.value.quantity),
      unit: form.value.unit || 'units',
      grade: form.value.grade || null,
      notes: form.value.notes || null,
      trace_number: null
    }

    try {
      const result = await resource.create(payload, payload)
      if (!result.ok) {
        submitError.value = result.message || 'Failed to save the collection'
        errorList.value = Object.values(result.errors ?? {}).flat()
        return
      }
      resetForm()
      closeModal()
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save the collection'
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    fetchProductions()
  })

  return {
    productions,
    loading,
    loadError,
    submitting,
    submitError,
    errorList,
    showModal,
    form,
    weekTotals,
    selectProduct,
    openModal,
    closeModal,
    fetchProductions,
    saveProduction
  }
}
