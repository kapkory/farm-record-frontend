<template>
  <div class="space-y-6">
   
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4">
       <Button type="button" @click="openHarvestModal" :disabled="!plantingUuidValue" class="inline-flex items-center gap-2">
            <Plus class="h-4 w-4" />
            New Harvest
          </Button>
        <p class="mt-1 text-sm text-gray-500">See all harvest records already captured for this planting.</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading harvest records...</span>
      </div>

      <div v-else-if="loadError" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load harvest records</p>
        <p class="mt-1 text-sm">{{ loadError }}</p>
        <button @click="fetchHarvests" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Harvest Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Trace Number</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Unit</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Grade</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="harvest in harvests" :key="harvest.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ harvest.name || defaultHarvestName }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ harvest.date || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ harvest.trace_number || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{{ harvest.quantity ?? '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ harvest.unit || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ harvest.grade || '—' }}</td>
              <td class="max-w-sm px-6 py-4 text-sm text-gray-500">{{ harvest.notes || '—' }}</td>
            </tr>
            <tr v-if="!harvests.length">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No harvest records found yet. Add the first harvest above.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAddHarvestModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeHarvestModal"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">New Harvest</h3>
                <p class="mt-1 text-sm text-gray-500">Fill in the harvest details below. The date defaults to today and the name defaults to the crop name.</p>
              </div>
              <button type="button" @click="closeHarvestModal" class="text-gray-400 transition-colors hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="saveHarvest" class="space-y-5 p-6">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <Label for="harvest_name" class="mb-1 block text-sm font-medium text-gray-700">Harvest Name</Label>
                  <Input id="harvest_name" v-model="harvestForm.name" type="text" class="w-full" placeholder="Example: Maize" />
                  <p v-if="formErrors.name" class="mt-1 text-xs text-red-600">{{ formErrors.name }}</p>
                </div>

                <div>
                  <Label for="harvest_date" class="mb-1 block text-sm font-medium text-gray-700">Date Harvested</Label>
                  <Input id="harvest_date" v-model="harvestForm.date" type="date" class="w-full" />
                  <p v-if="formErrors.date" class="mt-1 text-xs text-red-600">{{ formErrors.date }}</p>
                </div>

                <div>
                  <Label for="harvest_trace_number" class="mb-1 block text-sm font-medium text-gray-700">Trace Number</Label>
                  <Input id="harvest_trace_number" v-model="harvestForm.trace_number" type="text" class="w-full" placeholder="Optional batch or trace number" />
                  <p v-if="formErrors.trace_number" class="mt-1 text-xs text-red-600">{{ formErrors.trace_number }}</p>
                </div>

                <div>
                  <Label for="harvest_quantity" class="mb-1 block text-sm font-medium text-gray-700">Quantity Harvested</Label>
                  <Input id="harvest_quantity" v-model="harvestForm.quantity" type="number" min="0" step="1" class="w-full" placeholder="0" />
                  <p v-if="formErrors.quantity" class="mt-1 text-xs text-red-600">{{ formErrors.quantity }}</p>
                </div>

                <div>
                  <Label for="harvest_unit" class="mb-1 block text-sm font-medium text-gray-700">Unit Used</Label>
                  <Input id="harvest_unit" v-model="harvestForm.unit" list="harvest-units" type="text" class="w-full" placeholder="Bags, Kgs, Bales" />
                  <datalist id="harvest-units">
                    <option value="Bags" />
                    <option value="Kgs" />
                    <option value="Bales" />
                    <option value="Crates" />
                    <option value="Tonnes" />
                    <option value="Pieces" />
                  </datalist>
                  <p v-if="formErrors.unit" class="mt-1 text-xs text-red-600">{{ formErrors.unit }}</p>
                </div>

                <div>
                  <Label for="harvest_grade" class="mb-1 block text-sm font-medium text-gray-700">Grade</Label>
                  <Input id="harvest_grade" v-model="harvestForm.grade" type="text" class="w-full" placeholder="Optional grade" />
                  <p v-if="formErrors.grade" class="mt-1 text-xs text-red-600">{{ formErrors.grade }}</p>
                </div>
              </div>

              <div>
                <Label for="harvest_notes" class="mb-1 block text-sm font-medium text-gray-700">Notes</Label>
                <textarea id="harvest_notes" v-model="harvestForm.notes" rows="4" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Add anything important about this harvest in simple words"></textarea>
                <p v-if="formErrors.notes" class="mt-1 text-xs text-red-600">{{ formErrors.notes }}</p>
              </div>

              <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p class="font-medium">Please fix the following before saving:</p>
                <p class="mt-1">{{ submitError }}</p>
                <ul v-if="errorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in errorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" @click="closeHarvestModal" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting || !plantingUuidValue">
                  <span v-if="submitting">Saving...</span>
                  <span v-else>Save Harvest</span>
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

interface HarvestRecord {
  id: number | string
  uuid?: string
  productionable_uuid?: string | null
  productionable_type?: string | null
  productionable?: { uuid?: string | null } | null
  name?: string | null
  quantity?: number | string | null
  date?: string | null
  unit?: string | null
  trace_number?: string | null
  grade?: string | null
  notes?: string | null
}

type HarvestFormErrorKey = 'name' | 'date' | 'trace_number' | 'quantity' | 'unit' | 'grade' | 'notes'

type HarvestValidationErrors = Partial<Record<HarvestFormErrorKey, string>>

const props = withDefaults(defineProps<{
  cropName?: string
  plantingUuid?: string
}>(), {
  cropName: '',
  plantingUuid: ''
})

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const route = useRoute()

const plantingUuidValue = computed(() => props.plantingUuid || String(route.params.uuid || ''))
const defaultHarvestName = computed(() => props.cropName?.trim() || 'Harvest')

const today = () => new Date().toISOString().split('T')[0] || ''

const createDefaultForm = () => ({
  name: defaultHarvestName.value,
  date: today(),
  trace_number: '',
  quantity: '',
  unit: '',
  grade: '',
  notes: ''
})

const harvests = ref<HarvestRecord[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const submitting = ref(false)
const submitError = ref<string | null>(null)
const showAddHarvestModal = ref(false)
const formErrors = ref<HarvestValidationErrors>({})
const errorList = ref<string[]>([])
const harvestForm = ref(createDefaultForm())

const belongsToCurrentPlanting = (record: HarvestRecord) => {
  const linkedUuid = record.productionable_uuid || record.productionable?.uuid || null
  if (linkedUuid) return linkedUuid === plantingUuidValue.value
  return true
}

const resetForm = () => {
  harvestForm.value = createDefaultForm()
  submitError.value = null
  formErrors.value = {}
  errorList.value = []
}

const openHarvestModal = () => {
  resetForm()
  showAddHarvestModal.value = true
}

const closeHarvestModal = () => {
  showAddHarvestModal.value = false
  submitError.value = null
  formErrors.value = {}
  errorList.value = []
}

const setValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
  const mapped: HarvestValidationErrors = {}
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

    if (key === 'name') mapped.name = message
    if (key === 'date') mapped.date = message
    if (key === 'trace_number') mapped.trace_number = message
    if (key === 'quantity') mapped.quantity = message
    if (key === 'unit') mapped.unit = message
    if (key === 'grade') mapped.grade = message
    if (key === 'notes') mapped.notes = message
  }

  formErrors.value = mapped
  errorList.value = [...new Set(list)]
}

const fetchHarvests = async () => {
  loading.value = true
  loadError.value = null

  try {
    if (!isOnline.value) {
      harvests.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: HarvestRecord[] }>(`/api/v1/farms/farm/productions/list/${plantingUuidValue.value}`)
    const records = response.data ?? []
    harvests.value = records.filter(belongsToCurrentPlanting)
  } catch (err: unknown) {
    loadError.value = err instanceof Error ? err.message : 'An error occurred while loading harvest records'
    console.error('Failed to fetch harvest records:', err)
    harvests.value = []
  } finally {
    loading.value = false
  }
}

const saveHarvest = async () => {
  if (!plantingUuidValue.value) return

  submitting.value = true
  submitError.value = null
  formErrors.value = {}
  errorList.value = []

  const payload = {
    productionable_type: 'planting',
    productionable_uuid: plantingUuidValue.value,
    name: harvestForm.value.name || defaultHarvestName.value,
    date: harvestForm.value.date || today(),
    trace_number: harvestForm.value.trace_number || null,
    quantity: Number(harvestForm.value.quantity),
    unit: harvestForm.value.unit || null,
    grade: harvestForm.value.grade || null,
    notes: harvestForm.value.notes || null
  }

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch('/api/v1/farms/farm/productions/store', {
      method: 'POST',
      body: payload
    })

    await fetchHarvests()
    resetForm()
    closeHarvestModal()
  } catch (err: unknown) {
    const responseData = typeof err === 'object' && err !== null && 'data' in err
      ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
      : undefined

    setValidationErrors(responseData?.errors)
    submitError.value = responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save harvest record')
    console.error('Failed to save harvest record:', err)
  } finally {
    submitting.value = false
  }
}

watch(
  () => [props.cropName, props.plantingUuid],
  () => {
    if (!harvestForm.value.name || harvestForm.value.name === 'Harvest') {
      harvestForm.value.name = defaultHarvestName.value
    }
  },
  { immediate: true }
)

onMounted(() => {
  resetForm()
  fetchHarvests()
})
</script>