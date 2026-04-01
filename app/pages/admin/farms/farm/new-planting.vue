<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        to="/admin/farms"
        class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        Back to Plantings
      </NuxtLink>
    </div>

    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">New Planting</h1>
      <p class="text-gray-600 mt-1">Record a new planting for a farm field</p>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
      <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
      <p class="text-green-700">{{ successMessage }}</p>
    </div>

    <!-- Error Message -->
    <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
      <AlertCircle class="w-5 h-5 text-red-500 flex-shrink-0" />
      <p class="text-red-700">{{ generalError }}</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">

        <!-- Row 1: Farm & Field -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Farm -->
          <div class="space-y-1">
            <Label for="farm_uuid" class="block text-sm font-semibold text-gray-700">
              Farm <span class="text-red-500">*</span>
            </Label>
            <div v-if="farmsLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading farms...
            </div>
            <select
              v-else
              id="farm_uuid"
              v-model="form.farm_uuid"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.farm_uuid }"
              @change="onFarmChange"
            >
              <option value="">Select a farm</option>
              <option v-for="farm in farms" :key="farm.uuid ?? farm.id" :value="farm.uuid ?? farm.id">
                {{ farm.name }}
              </option>
            </select>
            <p v-if="errors.farm_uuid" class="text-xs text-red-500">{{ errors.farm_uuid }}</p>
          </div>

          <!-- Field -->
          <div class="space-y-1">
            <Label for="field_uuid" class="block text-sm font-semibold text-gray-700">
              Field
            </Label>
            <div v-if="fieldsLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading fields...
            </div>
            <select
              v-else
              id="field_uuid"
              v-model="form.field_uuid"
              :disabled="!form.farm_uuid"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              :class="{ 'border-red-500': errors.field_uuid }"
            >
              <option value="">{{ form.farm_uuid ? 'Select a field' : 'Select a farm first' }}</option>
              <option v-for="field in fields" :key="field.uuid ?? field.id" :value="field.uuid ?? field.id">
                {{ field.name }}
              </option>
            </select>
            <p v-if="errors.field_uuid" class="text-xs text-red-500">{{ errors.field_uuid }}</p>
          </div>
        </div>

        <!-- Row 2: Crop & Variety -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Crop -->
          <div class="space-y-1">
            <Label for="crop_id" class="block text-sm font-semibold text-gray-700">
              Crop <span class="text-red-500">*</span>
            </Label>
            <div v-if="cropsLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading crops...
            </div>
            <select
              v-else
              id="crop_id"
              v-model="form.crop_id"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.crop_id }"
              @change="onCropChange"
            >
              <option value="">Select a crop</option>
              <option v-for="crop in crops" :key="crop.id" :value="crop.id">
                {{ crop.name }}
              </option>
            </select>
            <p v-if="errors.crop_id" class="text-xs text-red-500">{{ errors.crop_id }}</p>
          </div>

          <!-- Variety -->
          <div class="space-y-1">
            <Label for="variety_id" class="block text-sm font-semibold text-gray-700">
              Variety
            </Label>
            <select
              id="variety_id"
              v-model="form.variety_id"
              :disabled="!form.crop_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              :class="{ 'border-red-500': errors.variety_id }"
            >
              <option value="">{{ form.crop_id ? 'Select a variety' : 'Select a crop first' }}</option>
              <option v-for="variety in filteredVarieties" :key="variety.id" :value="variety.id">
                {{ variety.name }}
              </option>
            </select>
            <p v-if="errors.variety_id" class="text-xs text-red-500">{{ errors.variety_id }}</p>
          </div>
        </div>

        <!-- Row 3: Date Planted & Quantity -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date Planted -->
          <div class="space-y-1">
            <Label for="date_planted" class="block text-sm font-semibold text-gray-700">
              Date Planted <span class="text-red-500">*</span>
            </Label>
            <Input
              id="date_planted"
              v-model="form.date_planted"
              type="date"
              required
              :class="errors.date_planted ? 'w-full border-red-500' : 'w-full'"
            />
            <p v-if="errors.date_planted" class="text-xs text-red-500">{{ errors.date_planted }}</p>
          </div>

          <!-- Quantity Planted -->
          <div class="space-y-1">
            <Label for="quantity_planted" class="block text-sm font-semibold text-gray-700">
              Quantity Planted 
            </Label>
            <Input
              id="quantity_planted"
              v-model="form.quantity_planted"
              type="number"
              placeholder="For crops such as fruits, coffee e.g. 500"
    
              :class="errors.quantity_planted ? 'w-full border-red-500' : 'w-full'"
            />
            <p v-if="errors.quantity_planted" class="text-xs text-red-500">{{ errors.quantity_planted }}</p>
          </div>
        </div>

        <!-- Row 4: description -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <Label for="purpose" class="block text-sm font-semibold text-gray-700">
              Purpose <span class="text-red-500">*</span>
            </Label>
            <select
              id="purpose"
              v-model="form.purpose"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.purpose }"
            >
              <option value="">Select purpose</option>
              <option value="commercial">Commercial</option>
              <option value="consumption">Consumption</option>
              <option value="mixed">Mixed</option>
            </select>
            <p v-if="errors.purpose" class="text-xs text-red-500">{{ errors.purpose }}</p>
          </div>
           <div class="space-y-1">
            <Label for="description" class="block text-sm font-semibold text-gray-700">
              Description
            </Label>
            <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  placeholder="Capture any additional details about this planting (e.g. seed source, planting method, notes)"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
            <p v-if="errors.description" class="text-xs text-red-500">{{ errors.description }}</p>
          </div>
        </div>

        <!-- Row 5: Planting Schedule -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <Label for="planting_schedule_uuid" class="block text-sm font-semibold text-gray-700">
              Planting Schedule
            </Label>
            <div v-if="schedulesLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading schedules...
            </div>
            <select
              v-else
              id="planting_schedule_uuid"
              v-model="form.planting_schedule_uuid"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">No schedule (add tasks manually)</option>
              <option v-for="schedule in filteredSchedules" :key="schedule.uuid" :value="schedule.uuid">
                {{ schedule.name }}
                <template v-if="schedule.activities?.length">
                  ({{ schedule.activities.length }} tasks)
                </template>
              </option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Select a schedule to auto-generate tasks based on your planting date</p>
          </div>

          <!-- Schedule Preview -->
          <div v-if="selectedSchedule" class="space-y-1">
            <Label class="block text-sm font-semibold text-gray-700">Schedule Preview</Label>
            <div class="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
              <div
                v-for="(activity, idx) in selectedSchedule.activities"
                :key="idx"
                class="flex items-center gap-2 text-xs py-1"
                :class="{ 'border-t border-gray-200': idx > 0 }"
              >
                <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold flex-shrink-0">
                  {{ idx + 1 }}
                </span>
                <span class="font-medium text-gray-700">{{ activity.title }}</span>
                <span class="text-gray-400">—</span>
                <span class="text-green-600">{{ activity.offset_value }} {{ activity.offset_unit }} after planting</span>
              </div>
              <p v-if="!selectedSchedule.activities?.length" class="text-xs text-gray-400 italic">No activities in this schedule</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <NuxtLink
            to="/admin/crops/plantings"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Cancel
          </NuxtLink>
          <Button type="submit" :disabled="submitting">
            <span v-if="submitting" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </span>
            <span v-else class="flex items-center">
              <Sprout class="w-4 h-4 mr-2" />
              Save Planting
            </span>
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChevronLeft, Sprout, CheckCircle, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

interface Farm {
  id: string | number
  uuid?: string
  name: string
}

interface Field {
  id: number
  uuid?: string
  name: string
  is_active: boolean
}

interface Crop {
  id: number
  name: string
}

interface CropVariety {
  id: number
  crop_id: number
  name: string
}

interface ScheduleActivity {
  title: string
  offset_value: number
  offset_unit: 'days' | 'weeks' | 'months'
  priority: number
  description: string
}

interface PlantingSchedule {
  id?: number
  uuid?: string
  name: string
  crop_id?: number | string
  status: string
  activities: ScheduleActivity[]
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const router = useRouter()

// Data lists
const farms = ref<Farm[]>([])
const fields = ref<Field[]>([])
const crops = ref<Crop[]>([])
const varieties = ref<CropVariety[]>([])
const plantingSchedules = ref<PlantingSchedule[]>([])

// Loading states
const farmsLoading = ref(true)
const fieldsLoading = ref(false)
const cropsLoading = ref(true)
const schedulesLoading = ref(true)
const submitting = ref(false)

// Messages
const successMessage = ref<string | null>(null)
const generalError = ref<string | null>(null)

// Form state
const form = ref({
  farm_uuid: '',
  field_uuid: '',
  crop_id: '',
  variety_id: '',
  date_planted: new Date().toISOString().split('T')[0],
  quantity_planted: '',
  purpose: 'commercial',
  description: '',
  planting_schedule_uuid: ''
})

const errors = ref<Record<string, string>>({})

// Varieties filtered by selected crop
const filteredVarieties = computed(() =>
  form.value.crop_id
    ? varieties.value.filter(v => v.crop_id === Number(form.value.crop_id))
    : []
)

// Schedules filtered by selected crop (show generic + crop-specific)
const filteredSchedules = computed(() =>
  plantingSchedules.value.filter(s =>
    s.status === 'active' && (!s.crop_id || s.crop_id === Number(form.value.crop_id))
  )
)

// Currently selected schedule for preview
const selectedSchedule = computed(() =>
  form.value.planting_schedule_uuid
    ? plantingSchedules.value.find(s => s.uuid === form.value.planting_schedule_uuid) ?? null
    : null
)

// When farm changes, reset field and fetch fields for selected farm
const onFarmChange = async () => {
  form.value.field_uuid = ''
  fields.value = []

  if (!form.value.farm_uuid) return

  fieldsLoading.value = true
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Field[] }>(`/api/v1/farms/fields/list/${form.value.farm_uuid}`)
      fields.value = response.data ?? (response as unknown as Field[])
    }
  } catch (err) {
    console.error('Failed to fetch fields:', err)
  } finally {
    fieldsLoading.value = false
  }
}

// When crop changes, reset variety and schedule
const onCropChange = () => {
  form.value.variety_id = ''
  form.value.planting_schedule_uuid = ''
}

// Fetch farms list
const fetchFarms = async () => {
  farmsLoading.value = true
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Farm[] }>('/api/v1/farms')
      farms.value = response.data ?? (response as unknown as Farm[])
    }
  } catch (err) {
    console.error('Failed to fetch farms:', err)
  } finally {
    farmsLoading.value = false
  }
}

// Fetch crops and varieties
const fetchCropsAndVarieties = async () => {
  cropsLoading.value = true
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const [cropsRes, varietiesRes] = await Promise.all([
        $apiFetch<{ data: Crop[] }>('/api/v1/settings/crops/list'),
        $apiFetch<{ data: CropVariety[] }>('/api/v1/settings/crops/varieties/list')
      ])
      crops.value = cropsRes.data ?? (cropsRes as unknown as Crop[])
      varieties.value = varietiesRes.data ?? (varietiesRes as unknown as CropVariety[])
    }
  } catch (err) {
    console.error('Failed to fetch crops/varieties:', err)
  } finally {
    cropsLoading.value = false
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  if (!form.value.farm_uuid) errors.value.farm_uuid = 'Please select a farm'
  if (!form.value.crop_id) errors.value.crop_id = 'Please select a crop'
  if (!form.value.date_planted) errors.value.date_planted = 'Please select a date'
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  generalError.value = null
  successMessage.value = null

  if (!validateForm()) return

  submitting.value = true

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
    }

    const payload = {
      farm_uuid: form.value.farm_uuid,
      field_uuid: form.value.field_uuid,
      crop_id: form.value.crop_id,
      variety_id: form.value.variety_id,
      date_planted: form.value.date_planted,
      quantity_planted: Number(form.value.quantity_planted),
      purpose: form.value.purpose,
      description: form.value.description,
      planting_schedule_uuid: form.value.planting_schedule_uuid || null
    }

    if (isOnline.value) {
      const response = await $apiFetch<{ data?: { uuid?: string } }>('/api/v1/farms/farm/plantings', {
        method: 'POST',
        body: payload
      })
      const uuid = response?.data?.uuid
      if (uuid) {
        await router.push(`/admin/farms/farm/planting/${uuid}`)
        return
      }
    }

    successMessage.value = 'Planting saved successfully!'
    await router.push('/admin/crops/plantings')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the planting'
    console.error('Failed to save planting:', err)
    generalError.value = errorMessage
  } finally {
    submitting.value = false
  }
}

const fetchSchedules = async () => {
  schedulesLoading.value = true
  try {
    if (isOnline.value) {
      const response = await $apiFetch<{ data: PlantingSchedule[] }>('/api/v1/settings/crops/planting-schedules/list')
      plantingSchedules.value = response.data ?? (response as unknown as PlantingSchedule[])
    }
  } catch (err) {
    console.error('Failed to fetch planting schedules:', err)
  } finally {
    schedulesLoading.value = false
  }
}

onMounted(() => {
  fetchFarms()
  fetchCropsAndVarieties()
  fetchSchedules()
})
</script>
