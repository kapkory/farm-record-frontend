import { db, type Breeding, type SyncQueue } from '../utils/db'

export interface BreedingRecord {
  uuid?: string
  id?: string
  farm_id?: number | string | null
  dam_id?: number | string | null
  dam?: {
    uuid?: string
    name?: string | null
    tag_number?: string | null
    animal_type?: { id?: number; name?: string } | null
    breed?: { id?: number; name?: string } | null
  } | null
  sire_id?: number | string | null
  sire?: {
    uuid?: string
    name?: string | null
    tag_number?: string | null
    animal_type?: { id?: number; name?: string } | null
    breed?: { id?: number; name?: string } | null
  } | null
  sire_type: 'natural' | 'ai' | 'embryo'
  service_date: string
  service_date_human?: string | null
  expected_birth_date?: string | null
  expected_birth_date_human?: string | null
  status: 'pending' | 'born' | 'aborted' | 'failed'
  ai_straw_code?: string | null
  ai_bull_name?: string | null
  ai_technician?: string | null
  notes?: string | null
  synced?: boolean
  created_at?: string
  updated_at?: string
}

type BreedingFormErrorKey = 'sire_type' | 'sire_id' | 'service_date' | 'expected_birth_date' | 'status' | 'ai_straw_code' | 'ai_bull_name' | 'ai_technician' | 'notes'
type BreedingValidationErrors = Partial<Record<BreedingFormErrorKey, string>>

export const useAnimalBreedings = (animalUuid: string, trackingType: 'individual' | 'group') => {
  const { $apiFetch } = useNuxtApp()
  const { isOnline } = useOffline()

  const today = () => new Date().toISOString().split('T')[0] ?? ''

  const createDefaultForm = () => ({
    sire_type: 'natural' as 'natural' | 'ai' | 'embryo',
    sire_id: '' as string,
    service_date: today(),
    expected_birth_date: '',
    status: 'pending' as 'pending' | 'born' | 'aborted' | 'failed',
    ai_straw_code: '',
    ai_bull_name: '',
    ai_technician: '',
    notes: ''
  })

  const breedings = ref<BreedingRecord[]>([])
  const sireOptions = ref<Array<{ uuid: string; name: string; tag_number: string | null; gender?: string }>>([])
  const loading = ref(true)
  const loadError = ref<string | null>(null)
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const showModal = ref(false)
  const formErrors = ref<BreedingValidationErrors>({})
  const errorList = ref<string[]>([])
  const breedingForm = ref(createDefaultForm())
  const sireSearch = ref('')
  const showSireResults = ref(false)

  const filteredSires = computed(() => {
    const query = sireSearch.value.trim().toLowerCase()
    if (!query) return sireOptions.value
    return sireOptions.value.filter(s =>
      (s.name?.toLowerCase() ?? '').includes(query) ||
      (s.tag_number?.toLowerCase() ?? '').includes(query)
    )
  })

  const resetForm = () => {
    breedingForm.value = createDefaultForm()
    submitError.value = null
    formErrors.value = {}
    errorList.value = []
    sireSearch.value = ''
    showSireResults.value = false
  }

  const openModal = () => {
    resetForm()
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    submitError.value = null
    formErrors.value = {}
    errorList.value = []
    showSireResults.value = false
  }

  const handleSireSearch = () => {
    breedingForm.value.sire_id = ''
    showSireResults.value = true
  }

  const selectSire = (sire: { uuid: string; name: string; tag_number: string | null; gender?: string }) => {
    breedingForm.value.sire_id = sire.uuid
    sireSearch.value = `${sire.name}${sire.tag_number ? ` (${sire.tag_number})` : ''}`
    showSireResults.value = false
  }

  const setValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
    const mapped: BreedingValidationErrors = {}
    const list: string[] = []
    if (!errors) { formErrors.value = {}; errorList.value = []; return }
    for (const [key, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value
      if (!message) continue
      list.push(message)
      mapped[key as BreedingFormErrorKey] = message
    }
    formErrors.value = mapped
    errorList.value = [...new Set(list)]
  }

  const sireTypeLabel = (type: string) => {
    switch (type) {
      case 'natural': return 'Natural'
      case 'ai': return 'AI'
      case 'embryo': return 'Embryo'
      default: return type
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'born': return 'Born'
      case 'aborted': return 'Aborted'
      case 'failed': return 'Failed'
      default: return status
    }
  }

  const fetchSires = async () => {
    try {
      if (isOnline.value) {
        await $apiFetch('/sanctum/csrf-cookie')
        const response = await $apiFetch<{ data?: Array<{ uuid: string; name: string; tag_number: string | null; gender?: string }> }>(
          '/api/v1/farms/farm/animals/livestocks/list?gender=male'
        )
        sireOptions.value = response.data ?? []
      } else {
        // Offline fallback: read from IndexedDB cache and filter males only
        const cached = await db.getCache('livestock_list')
        if (Array.isArray(cached)) {
          sireOptions.value = cached.filter((a: any) => a.gender === 'male')
        } else {
          sireOptions.value = []
        }
      }
    } catch (err) {
      console.error('Failed to fetch sires:', err)
      sireOptions.value = []
    }
  }

  const fetchBreedings = async () => {
    loading.value = true
    loadError.value = null
    try {
      if (isOnline.value) {
        await $apiFetch('/sanctum/csrf-cookie')
        const response = await $apiFetch<{ data?: BreedingRecord[] }>(
          `/api/v1/farms/farm/animals/breedings/list/${animalUuid}`
        )
        const records = response.data ?? []

        // Store fetched records in IndexedDB for offline access
        for (const record of records) {
          const localRecord: Breeding = {
            id: record.uuid || crypto.randomUUID(),
            animal_uuid: animalUuid,
            farm_id: record.farm_id ?? null,
            dam_id: record.dam_id ?? null,
            sire_id: record.sire_id ?? null,
            sire_type: record.sire_type,
            service_date: record.service_date,
            expected_birth_date: record.expected_birth_date ?? null,
            status: record.status,
            ai_straw_code: record.ai_straw_code ?? null,
            ai_bull_name: record.ai_bull_name ?? null,
            ai_technician: record.ai_technician ?? null,
            notes: record.notes ?? null,
            synced: true,
            createdAt: record.created_at || new Date().toISOString(),
            updatedAt: record.updated_at || new Date().toISOString()
          }
          await db.addBreeding(localRecord)
        }

        breedings.value = records
      } else {
        // Offline: read from IndexedDB
        const localBreedings = await db.getBreedingsByAnimal(animalUuid)
        breedings.value = localBreedings.map(b => ({
          uuid: b.id,
          farm_id: b.farm_id,
          dam_id: b.dam_id,
          sire_id: b.sire_id,
          sire_type: b.sire_type,
          service_date: b.service_date,
          expected_birth_date: b.expected_birth_date,
          status: b.status,
          ai_straw_code: b.ai_straw_code,
          ai_bull_name: b.ai_bull_name,
          ai_technician: b.ai_technician,
          notes: b.notes,
          synced: b.synced,
          created_at: b.createdAt,
          updated_at: b.updatedAt
        }))
      }
    } catch (err) {
      // Fallback to IndexedDB on API error
      try {
        const localBreedings = await db.getBreedingsByAnimal(animalUuid)
        breedings.value = localBreedings.map(b => ({
          uuid: b.id,
          farm_id: b.farm_id,
          dam_id: b.dam_id,
          sire_id: b.sire_id,
          sire_type: b.sire_type,
          service_date: b.service_date,
          expected_birth_date: b.expected_birth_date,
          status: b.status,
          ai_straw_code: b.ai_straw_code,
          ai_bull_name: b.ai_bull_name,
          ai_technician: b.ai_technician,
          notes: b.notes,
          synced: b.synced,
          created_at: b.createdAt,
          updated_at: b.updatedAt
        }))
      } catch {
        loadError.value = err instanceof Error ? err.message : 'An error occurred while loading breedings'
        console.error('Failed to fetch breedings:', err)
        breedings.value = []
      }
    } finally {
      loading.value = false
    }
  }

  const saveBreeding = async () => {
    submitting.value = true
    submitError.value = null
    formErrors.value = {}
    errorList.value = []

    const form = breedingForm.value
    const isAI = form.sire_type === 'ai'

    const payload = {
      dam_id: animalUuid,
      sire_id: (form.sire_type === 'natural' || form.sire_type === 'embryo') && form.sire_id
        ? form.sire_id
        : null,
      sire_type: form.sire_type,
      service_date: form.service_date || today(),
      expected_birth_date: form.expected_birth_date || null,
      status: form.status,
      ai_straw_code: isAI ? (form.ai_straw_code || null) : null,
      ai_bull_name: isAI ? (form.ai_bull_name || null) : null,
      ai_technician: isAI ? (form.ai_technician || null) : null,
      notes: form.notes || null
    }

    // Save to IndexedDB first (offline-first)
    const localId = crypto.randomUUID()
    const localBreeding: Breeding = {
      id: localId,
      animal_uuid: animalUuid,
      farm_id: null,
      dam_id: payload.dam_id,
      sire_id: payload.sire_id,
      sire_type: payload.sire_type,
      service_date: payload.service_date,
      expected_birth_date: payload.expected_birth_date,
      status: payload.status,
      ai_straw_code: payload.ai_straw_code,
      ai_bull_name: payload.ai_bull_name,
      ai_technician: payload.ai_technician,
      notes: payload.notes,
      synced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      await db.addBreeding(localBreeding)

      // Add to sync queue
      const syncItem: SyncQueue = {
        id: crypto.randomUUID(),
        action: 'create',
        entity: 'breeding',
        data: { ...payload, _localId: localId },
        timestamp: Date.now(),
        synced: false
      }
      await db.addToSyncQueue(syncItem)

      if (isOnline.value) {
        // Try to sync immediately
        try {
          await $apiFetch('/sanctum/csrf-cookie')
          const response = await $apiFetch<{ data: BreedingRecord }>(
            '/api/v1/farms/farm/animals/breedings',
            { method: 'POST', body: payload }
          )

          // Update local record with server UUID and mark synced
          const serverRecord = response.data
          await db.deleteBreeding(localId)
          await db.addBreeding({
            ...localBreeding,
            id: serverRecord.uuid || localId,
            synced: true
          })
          await db.markSynced(syncItem.id)

          breedings.value.unshift(serverRecord)
        } catch (err) {
          // API failed but local save succeeded — stays in sync queue
          const responseData =
            typeof err === 'object' && err !== null && 'data' in err
              ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
              : undefined

          if (responseData?.errors) {
            setValidationErrors(responseData.errors)
            submitError.value = responseData?.message ?? 'Validation failed'
            // Remove from local DB and sync queue since validation failed
            await db.deleteBreeding(localId)
            await db.markSynced(syncItem.id)
            submitting.value = false
            return
          }

          // Network/server error — record stays local with synced: false
          console.error('API sync failed, queued for later:', err)
          breedings.value.unshift({
            uuid: localId,
            ...payload,
            synced: false,
            created_at: localBreeding.createdAt
          })
        }
      } else {
        // Offline — add to local list with synced: false
        breedings.value.unshift({
          uuid: localId,
          ...payload,
          synced: false,
          created_at: localBreeding.createdAt
        })
      }

      closeModal()
    } catch (err) {
      submitError.value = err instanceof Error ? err.message : 'Failed to save breeding record'
      console.error('Failed to save breeding:', err)
    } finally {
      submitting.value = false
    }
  }

  const updateBreedingStatus = async (breedingUuid: string, newStatus: 'pending' | 'born' | 'aborted' | 'failed') => {
    try {
      // Update locally first
      const existing = await db.getBreeding(breedingUuid)
      if (existing) {
        await db.updateBreeding({ ...existing, status: newStatus })
      }

      // Add to sync queue
      const syncItem: SyncQueue = {
        id: crypto.randomUUID(),
        action: 'update',
        entity: 'breeding',
        data: { uuid: breedingUuid, status: newStatus },
        timestamp: Date.now(),
        synced: false
      }
      await db.addToSyncQueue(syncItem)

      if (isOnline.value) {
        try {
          await $apiFetch('/sanctum/csrf-cookie')
          await $apiFetch(`/api/v1/farms/farm/animals/breedings/${breedingUuid}`, {
            method: 'PUT',
            body: { status: newStatus }
          })
          await db.markSynced(syncItem.id)
          if (existing) {
            await db.addBreeding({ ...existing, status: newStatus, synced: true, updatedAt: new Date().toISOString() })
          }
        } catch (err) {
          console.error('Failed to sync status update, queued for later:', err)
        }
      }

      // Update local ref
      const idx = breedings.value.findIndex(b => b.uuid === breedingUuid)
      if (idx !== -1) {
        breedings.value[idx] = { ...breedings.value[idx], status: newStatus }
      }
    } catch (err) {
      console.error('Failed to update breeding status:', err)
    }
  }

  onMounted(() => {
    fetchSires()
    fetchBreedings()
  })

  return {
    breedings,
    sireOptions,
    loading,
    loadError,
    submitting,
    submitError,
    showModal,
    formErrors,
    errorList,
    breedingForm,
    sireSearch,
    showSireResults,
    filteredSires,
    sireTypeLabel,
    statusLabel,
    resetForm,
    openModal,
    closeModal,
    handleSireSearch,
    selectSire,
    fetchBreedings,
    saveBreeding,
    updateBreedingStatus
  }
}
