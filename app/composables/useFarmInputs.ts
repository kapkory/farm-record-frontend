// Farm inputs — things bought in bulk and used across many animals (dip,
// drugs, vaccines, feed). Offline-first for the purchase record itself via
// useOfflineEntity; applications (using stock) post online because they draw
// stock down and attribute an already-posted cost, which needs the server.
//
// Owns form/label state and delegates persistence to the generic layer.

export interface InputApplicationTarget {
  uuid?: string
  type: 'animal' | 'animal_group'
  target_uuid?: string | null
  name?: string | null
  head_count?: number
  basis_value?: number | null
  allocated_cost?: number
}

export interface InputApplicationRecord {
  uuid?: string
  date?: string | null
  date_human?: string | null
  quantity_used?: number
  total_cost?: number
  allocation_basis?: string | null
  details?: string | null
  notes?: string | null
  targets?: InputApplicationTarget[]
}

export interface FarmInputRecord {
  uuid?: string
  name?: string | null
  category?: string | null
  treatment_type_id?: number | null
  treatment_type?: string | null
  quantity?: number
  unit?: string | null
  quantity_remaining?: number
  quantity_used?: number
  is_depleted?: boolean
  total_cost?: number
  unit_cost?: number
  purchase_date?: string | null
  purchase_date_human?: string | null
  supplier?: string | null
  notes?: string | null
  farm_uuid?: string | null
  farm?: { uuid: string, name: string } | null
  typical_use?: number | null
  applications_remaining?: number | null
  applications_count?: number
  applications?: InputApplicationRecord[]
  synced?: boolean
  sync_error?: string | null
  created_at?: string
}

export const INPUT_CATEGORIES = [
  { value: 'dip', label: 'Dip / Acaricide' },
  { value: 'drug', label: 'Drug / Dewormer' },
  { value: 'vaccine', label: 'Vaccine' },
  { value: 'feed', label: 'Feed' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'seed', label: 'Seed' },
  { value: 'other', label: 'Other' }
] as const

export const ALLOCATION_BASES = [
  { value: 'per_head', label: 'Split evenly per animal' },
  { value: 'by_weight', label: 'Split by live weight' },
  { value: 'manual', label: 'Enter each share manually' }
] as const

export const useFarmInputs = () => {
  const resource = useOfflineEntity<FarmInputRecord>('farmInput', {})
  const { isOnline } = useOffline()
  const { $apiFetch } = useNuxtApp()

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    uuid: '' as string,
    farm_uuid: '',
    name: '',
    category: 'dip' as string,
    quantity: null as number | null,
    unit: 'ml',
    total_cost: null as number | null,
    purchase_date: today(),
    supplier: '',
    notes: ''
  })

  const createDefaultApplyForm = () => ({
    date: today(),
    quantity_used: null as number | null,
    allocation_basis: 'per_head' as string,
    details: '',
    notes: '',
    // uuid -> selected; and per-target manual cost when basis === 'manual'
    targetUuids: [] as string[],
    manualCosts: {} as Record<string, number | null>
  })

  const inputs = resource.items
  const loading = resource.loading
  const loadError = resource.loadError
  const fromCache = resource.fromCache

  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const errorList = ref<string[]>([])
  const showModal = ref(false)
  const editing = ref(false)
  const inputForm = ref(createDefaultForm())

  const applying = ref(false)
  const applyError = ref<string | null>(null)
  const applyErrorList = ref<string[]>([])
  const showApplyModal = ref(false)
  const applyTarget = ref<FarmInputRecord | null>(null)
  const applyForm = ref(createDefaultApplyForm())

  const fetchInputs = () => resource.fetch()

  const categoryLabel = (value?: string | null) =>
    INPUT_CATEGORIES.find(c => c.value === value)?.label ?? (value || '—')

  const basisLabel = (value?: string | null) =>
    ALLOCATION_BASES.find(b => b.value === value)?.label ?? (value || '—')

  const resetForm = () => {
    inputForm.value = createDefaultForm()
    submitError.value = null
    errorList.value = []
    editing.value = false
  }

  const openModal = (defaultFarmUuid = '') => {
    resetForm()
    inputForm.value.farm_uuid = defaultFarmUuid
    showModal.value = true
  }

  const openEditModal = (input: FarmInputRecord) => {
    resetForm()
    editing.value = true
    inputForm.value = {
      uuid: input.uuid ?? '',
      farm_uuid: input.farm?.uuid ?? input.farm_uuid ?? '',
      name: input.name ?? '',
      category: input.category ?? 'dip',
      quantity: input.quantity ?? null,
      unit: input.unit ?? 'ml',
      total_cost: input.total_cost ?? null,
      purchase_date: input.purchase_date ?? today(),
      supplier: input.supplier ?? '',
      notes: input.notes ?? ''
    }
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
  }

  const saveInput = async () => {
    submitting.value = true
    submitError.value = null
    errorList.value = []

    const form = inputForm.value
    const payload = {
      farm_uuid: form.farm_uuid || null,
      name: form.name || null,
      category: form.category,
      quantity: form.quantity != null ? Number(form.quantity) : null,
      unit: form.unit || null,
      total_cost: form.total_cost != null ? Number(form.total_cost) : null,
      purchase_date: form.purchase_date || today(),
      supplier: form.supplier || null,
      notes: form.notes || null
    }

    try {
      const result = editing.value && form.uuid
        ? await resource.update(form.uuid, payload)
        : await resource.create(payload, payload)
      if (!result.ok) {
        errorList.value = [...new Set(Object.values(result.errors).flat())]
        submitError.value = result.message || 'Validation failed'
        return false
      }
      closeModal()
      return true
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save the input'
      return false
    } finally {
      submitting.value = false
    }
  }

  const removeInput = (uuid: string) => resource.remove(uuid)

  // ── Applications (using stock) ───────────────────────────────────────────
  const openApplyModal = (input: FarmInputRecord) => {
    applyTarget.value = input
    applyForm.value = createDefaultApplyForm()
    applyError.value = null
    applyErrorList.value = []
    showApplyModal.value = true
  }

  const closeApplyModal = () => {
    showApplyModal.value = false
    applyTarget.value = null
  }

  const saveApplication = async (targetOptions: Array<{ uuid: string, type: 'animal' | 'animal_group' }>) => {
    const input = applyTarget.value
    if (!input?.uuid) return false

    if (!isOnline.value) {
      applyError.value = 'Connect to the internet to record usage — it updates stock and costs.'
      return false
    }

    applying.value = true
    applyError.value = null
    applyErrorList.value = []

    const form = applyForm.value
    const selected = new Set(form.targetUuids)
    const targets = targetOptions
      .filter(o => selected.has(o.uuid))
      .map(o => ({
        type: o.type,
        uuid: o.uuid,
        ...(form.allocation_basis === 'manual'
          ? { manual_cost: form.manualCosts[o.uuid] != null ? Number(form.manualCosts[o.uuid]) : 0 }
          : {})
      }))

    if (!targets.length) {
      applyError.value = 'Choose at least one animal or group this covered.'
      applying.value = false
      return false
    }

    try {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch(`/api/v1/farms/farm/inputs/${input.uuid}/applications`, {
        method: 'POST',
        body: {
          uuid: crypto.randomUUID(),
          date: form.date || today(),
          quantity_used: form.quantity_used != null ? Number(form.quantity_used) : 0,
          allocation_basis: form.allocation_basis,
          details: form.details || null,
          notes: form.notes || null,
          targets
        }
      })
      await resource.fetch()
      closeApplyModal()
      return true
    } catch (err: any) {
      const data = err?.data ?? err?.response?._data
      if (data?.errors) applyErrorList.value = [...new Set(Object.values<any>(data.errors).flat())]
      applyError.value = data?.message || 'Failed to record usage'
      return false
    } finally {
      applying.value = false
    }
  }

  const reverseApplication = async (applicationUuid: string) => {
    if (!isOnline.value) return false
    try {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch(`/api/v1/farms/farm/inputs/applications/${applicationUuid}`, { method: 'DELETE' })
      await resource.fetch()
      return true
    } catch (err) {
      console.error('Failed to reverse application:', err)
      return false
    }
  }

  return {
    inputs,
    loading,
    loadError,
    fromCache,
    submitting,
    submitError,
    errorList,
    showModal,
    editing,
    inputForm,
    applying,
    applyError,
    applyErrorList,
    showApplyModal,
    applyTarget,
    applyForm,
    fetchInputs,
    categoryLabel,
    basisLabel,
    openModal,
    openEditModal,
    closeModal,
    saveInput,
    removeInput,
    openApplyModal,
    closeApplyModal,
    saveApplication,
    reverseApplication
  }
}
