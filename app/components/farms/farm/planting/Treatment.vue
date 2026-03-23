<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4">
        <Button type="button" @click="openTreatmentModal" :disabled="!plantingUuidValue" class="inline-flex items-center gap-2">
          <Plus class="h-4 w-4" />
          New Treatment
        </Button>
        <p class="mt-1 text-sm text-gray-500">See all treatment records already captured for this planting.</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading treatments...</span>
      </div>

      <div v-else-if="loadError" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load treatments</p>
        <p class="mt-1 text-sm">{{ loadError }}</p>
        <button @click="fetchTreatments" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Treatment Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Details</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Retreat Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="treatment in treatments" :key="treatment.uuid" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ treatment.date_human || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ mapTypeName(treatment) }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ treatment.details || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ treatment.retreat_date ?? '—' }}</td>
              <td class="max-w-sm px-6 py-4 text-sm text-gray-500">{{ treatment.notes || '—' }}</td>
            </tr>
            <tr v-if="!treatments.length">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No treatments found yet. Add the first treatment above.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAddTreatmentModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeTreatmentModal"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">New Treatment</h3>
                <p class="mt-1 text-sm text-gray-500">Record what you are doing on this planting, when you did it, and whether money was spent.</p>
              </div>
              <button type="button" @click="closeTreatmentModal" class="text-gray-400 transition-colors hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="saveTreatment" class="space-y-5 p-6">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                  <Label for="treatment_details" class="mb-1 block text-sm font-medium text-gray-700">Details</Label>
                  <Input id="treatment_details" v-model="treatmentForm.details" type="text" class="w-full" placeholder="Example: Spraying against fall armyworm" />
                  <p v-if="formErrors.details" class="mt-1 text-xs text-red-600">{{ formErrors.details }}</p>
                </div>

                <div>
                  <Label for="treatment_type_id" class="mb-1 block text-sm font-medium text-gray-700">Treatment Type</Label>
                  <div class="relative">
                    <Input
                      id="treatment_type_id"
                      v-model="treatmentTypeSearch"
                      type="text"
                      autocomplete="off"
                      class="w-full"
                      placeholder="Search treatment type"
                      @focus="showTreatmentTypeResults = true"
                      @input="handleTreatmentTypeSearch"
                    />
                    <div
                      v-if="showTreatmentTypeResults"
                      class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                    >
                      <button
                        v-for="type in searchedTreatmentTypes"
                        :key="type.id"
                        type="button"
                        class="block w-full border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                        @click="selectTreatmentType(type)"
                      >
                        <span class="block text-sm font-medium text-gray-900">{{ type.name }}</span>
                        <span v-if="type.description" class="block text-xs text-gray-500">{{ type.description }}</span>
                      </button>
                      <div v-if="!searchedTreatmentTypes.length" class="px-3 py-2 text-sm text-gray-500">
                        No matching treatment types found.
                      </div>
                    </div>
                  </div>
                  <p v-if="formErrors.treatment_type_id" class="mt-1 text-xs text-red-600">{{ formErrors.treatment_type_id }}</p>
                  <p v-if="selectedTreatmentType?.description" class="mt-1 text-xs text-gray-500">{{ selectedTreatmentType.description }}</p>
                </div>

                <div>
                  <Label for="treatment_date" class="mb-1 block text-sm font-medium text-gray-700">Date of Treatment</Label>
                  <Input id="treatment_date" v-model="treatmentForm.date" type="date" class="w-full" />
                  <p v-if="formErrors.date" class="mt-1 text-xs text-red-600">{{ formErrors.date }}</p>
                </div>

                <div>
                  <Label for="retreat_date" class="mb-1 block text-sm font-medium text-gray-700">Retreat Date</Label>
                  <Input id="retreat_date" v-model="treatmentForm.retreat_date" type="date" class="w-full" />
                  <p v-if="formErrors.retreat_date" class="mt-1 text-xs text-red-600">{{ formErrors.retreat_date }}</p>
                </div>
              </div>

              <div>
                <Label for="treatment_notes" class="mb-1 block text-sm font-medium text-gray-700">Notes</Label>
                <textarea id="treatment_notes" v-model="treatmentForm.notes" rows="4" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter quantity used, drugs used, and anything else important"></textarea>
                <p v-if="formErrors.notes" class="mt-1 text-xs text-red-600">{{ formErrors.notes }}</p>
              </div>

              <input type="hidden" name="farm_id" :value="treatmentForm.farm_id" />
              <input type="hidden" name="planting_uuid" :value="treatmentForm.planting_uuid" />
              <input type="hidden" name="model" :value="treatmentForm.model" />

              <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center">
                <label class="inline-flex items-center gap-3">
                  <input v-model="treatmentForm.record_expense" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <span class="text-sm font-medium text-gray-900">Record Expense</span>
                </label>

                <div v-if="treatmentForm.record_expense" class="sm:w-64">
                  <Input id="treatment_expense_amount" v-model="treatmentForm.expense_amount" type="number" min="0" step="0.01" class="w-full" placeholder="Expense Amount" />
                  <p v-if="formErrors.expense_amount" class="mt-1 text-xs text-red-600">{{ formErrors.expense_amount }}</p>
                </div>
              </div>

              <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p class="font-medium">Please fix the following before saving:</p>
                <p class="mt-1">{{ submitError }}</p>
                <ul v-if="errorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in errorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" @click="closeTreatmentModal" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting || !plantingUuidValue">
                  <span v-if="submitting">Saving...</span>
                  <span v-else>Save Treatment</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { Plus, X } from 'lucide-vue-next'

interface TreatmentRecord {
  uuid?: string
  planting_uuid?: string | null
  farm_id?: string | null
  model?: string | null
  treatment_type_id?: number | string | null
  treatment_type_name?: string | null
  treatment_type?: string | { id?: number | string | null; name?: string | null } | null
  type?: string | null
  details?: string | null
  date?: string | null
  date_human?: string | null
  notes?: string | null
  retreat_date?: string | null
  expense_amount?: number | string | null
}

interface TreatmentTypeOption {
  id: number | string
  name: string
  description?: string | null
  status?: 'active' | 'inactive' | 1 | 0 | '1' | '0'
}

type TreatmentFormErrorKey = 'details' | 'treatment_type_id' | 'date' | 'notes' | 'retreat_date' | 'expense_amount'

type TreatmentValidationErrors = Partial<Record<TreatmentFormErrorKey, string>>

const props = withDefaults(defineProps<{
  farmId?: string
  plantingUuid?: string
}>(), {
  farmId: '',
  plantingUuid: ''
})

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const route = useRoute()

const plantingUuidValue = computed(() => props.plantingUuid || String(route.params.uuid || ''))
const farmIdValue = computed(() => props.farmId || '')

const today = () => new Date().toISOString().split('T')[0] || ''

const createDefaultForm = () => ({
  details: '',
  treatment_type_id: '',
  farm_id: farmIdValue.value,
  planting_uuid: plantingUuidValue.value,
  model: 'planting',
  date: today(),
  notes: '',
  retreat_date: '',
  record_expense: false,
  expense_amount: ''
})

const treatmentTypes = ref<TreatmentTypeOption[]>([])
const treatments = ref<TreatmentRecord[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const submitting = ref(false)
const submitError = ref<string | null>(null)
const showAddTreatmentModal = ref(false)
const formErrors = ref<TreatmentValidationErrors>({})
const errorList = ref<string[]>([])
const treatmentForm = ref(createDefaultForm())
const treatmentTypeSearch = ref('')
const showTreatmentTypeResults = ref(false)

const mapTypeName = (record: TreatmentRecord) => {
  if (record.treatment_type_name) return record.treatment_type_name
  if (typeof record.treatment_type === 'string' && record.treatment_type) return record.treatment_type
  if (record.treatment_type && typeof record.treatment_type === 'object') return record.treatment_type.name || '—'
  return '—'
}

const normalizeStatus = (status: TreatmentTypeOption['status']) =>
  status === 1 || status === '1' || status === 'active' ? 'active' : 'inactive'

const activeTreatmentTypes = computed(() =>
  treatmentTypes.value.filter((type) => normalizeStatus(type.status) === 'active')
)

const searchedTreatmentTypes = computed(() => {
  const query = treatmentTypeSearch.value.trim().toLowerCase()

  if (!query) return activeTreatmentTypes.value

  return activeTreatmentTypes.value.filter((type) => {
    const name = type.name.toLowerCase()
    const description = type.description?.toLowerCase() ?? ''
    return name.includes(query) || description.includes(query)
  })
})

const selectedTreatmentType = computed(() =>
  treatmentTypes.value.find((type) => String(type.id) === treatmentForm.value.treatment_type_id) ?? null
)

const formatExpense = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount)
}

const resetForm = () => {
  treatmentForm.value = createDefaultForm()
  submitError.value = null
  formErrors.value = {}
  errorList.value = []
}

const openTreatmentModal = () => {
  resetForm()
  treatmentTypeSearch.value = ''
  showTreatmentTypeResults.value = false
  showAddTreatmentModal.value = true
}

const closeTreatmentModal = () => {
  showAddTreatmentModal.value = false
  submitError.value = null
  formErrors.value = {}
  errorList.value = []
  showTreatmentTypeResults.value = false
}

const handleTreatmentTypeSearch = () => {
  treatmentForm.value.treatment_type_id = ''
  showTreatmentTypeResults.value = true
}

const selectTreatmentType = (type: TreatmentTypeOption) => {
  treatmentForm.value.treatment_type_id = String(type.id)
  treatmentTypeSearch.value = type.name
  showTreatmentTypeResults.value = false
}

const setValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
  const mapped: TreatmentValidationErrors = {}
  const list: string[] = []

  if (!errors) {
    formErrors.value = {}
    errorList.value = []
    return
  }

  for (const [key, value] of Object.entries(errors)) {
    const message = Array.isArray(value) ? value[0] : value
    if (!message) continue

    list.push(message)

    if (key === 'details') mapped.details = message
    if (key === 'treatment_type_id') mapped.treatment_type_id = message
    if (key === 'date') mapped.date = message
    if (key === 'notes') mapped.notes = message
    if (key === 'retreat_date') mapped.retreat_date = message
    if (key === 'expense_amount') mapped.expense_amount = message
  }

  formErrors.value = mapped
  errorList.value = [...new Set(list)]
}

const fetchTreatmentTypes = async () => {
  try {
    if (!isOnline.value) {
      treatmentTypes.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: TreatmentTypeOption[] }>('/api/v1/settings/crops/treatment-types/list')
    treatmentTypes.value = (response.data ?? []).map((type) => ({
      ...type,
      status: normalizeStatus(type.status)
    }))
  } catch (err) {
    console.error('Failed to fetch treatment types:', err)
    treatmentTypes.value = []
  }
}

const fetchTreatments = async () => {
  loading.value = true
  loadError.value = null

  try {
    if (!isOnline.value) {
      treatments.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: TreatmentRecord[] }>(`/api/v1/farms/farm/crops/treatments/list/${plantingUuidValue.value}`)
    const records = response.data ?? []
    treatments.value = records.map(record => ({
      ...record,
      treatment_type_name: mapTypeName(record)
    }))
  } catch (err: unknown) {
    loadError.value = err instanceof Error ? err.message : 'An error occurred while loading treatments'
    console.error('Failed to fetch treatments:', err)
    treatments.value = []
  } finally {
    loading.value = false
  }
}

const saveTreatment = async () => {
  if (!plantingUuidValue.value) return

  if (treatmentForm.value.record_expense && !treatmentForm.value.expense_amount) {
    submitError.value = 'Please enter the expense amount before saving.'
    formErrors.value = { expense_amount: 'Please enter the expense amount before saving.' }
    errorList.value = ['Please enter the expense amount before saving.']
    return
  }

  submitting.value = true
  submitError.value = null
  formErrors.value = {}
  errorList.value = []

  const payload = {
    details: treatmentForm.value.details,
    treatment_type_id: treatmentForm.value.treatment_type_id ? Number(treatmentForm.value.treatment_type_id) : null,
    farm_id: treatmentForm.value.farm_id || null,
    planting_uuid: treatmentForm.value.planting_uuid,
    model: treatmentForm.value.model,
    date: treatmentForm.value.date || today(),
    notes: treatmentForm.value.notes || null,
    retreat_date: treatmentForm.value.retreat_date || null,
    record_expense: treatmentForm.value.record_expense,
    expense_amount: treatmentForm.value.record_expense ? Number(treatmentForm.value.expense_amount) : null
  }

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch('/api/v1/farms/farm/crops/treatments/', {
      method: 'POST',
      body: payload
    })

    await fetchTreatments()
    resetForm()
    closeTreatmentModal()
  } catch (err: unknown) {
    const responseData = typeof err === 'object' && err !== null && 'data' in err
      ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
      : undefined

    setValidationErrors(responseData?.errors)
    submitError.value = responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save treatment record')
    console.error('Failed to save treatment record:', err)
  } finally {
    submitting.value = false
  }
}

watch(
  () => [props.farmId, props.plantingUuid],
  () => {
    treatmentForm.value.farm_id = farmIdValue.value
    treatmentForm.value.planting_uuid = plantingUuidValue.value
  },
  { immediate: true }
)

onMounted(() => {
  resetForm()
  fetchTreatmentTypes()
  fetchTreatments()
})
</script>