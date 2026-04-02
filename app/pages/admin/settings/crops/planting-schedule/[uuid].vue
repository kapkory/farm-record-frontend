<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        to="/admin/settings/crops/planting-schedules"
        class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        Back to Planting Schedules
      </NuxtLink>
    </div>

    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">{{ isEditing ? 'Edit Planting Schedule' : 'New Planting Schedule' }}</h1>
      <p class="text-gray-600 mt-1">
        {{ isEditing ? 'Update the schedule details and activities below.' : 'Define a reusable activity schedule. When applied to a planting, tasks are auto-generated based on the planting date.' }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="pageLoading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading schedule...</span>
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

    <template v-if="!pageLoading">
      <form @submit.prevent="handleSubmit">
        <!-- Schedule Details Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Schedule Details</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div class="space-y-1">
              <Label for="name" class="block text-sm font-semibold text-gray-700">
                Schedule Name <span class="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="e.g. Maize Standard Schedule"
                required
                class="w-full"
              />
            </div>

            <!-- Crop -->
            <div class="space-y-1">
              <Label for="crop_id" class="block text-sm font-semibold text-gray-700">
                Crop
              </Label>
              <div v-if="cropsLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                Loading crops...
              </div>
              <select
                v-else
                id="crop_id"
                v-model="form.crop_id"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Any crop (generic schedule)</option>
                <option v-for="crop in crops" :key="crop.id" :value="crop.id">
                  {{ crop.name }}
                </option>
              </select>
              <p class="text-xs text-gray-400">Optionally link this schedule to a specific crop</p>
            </div>
            
          </div>
        </div>

        <!-- Activities Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex items-center justify-between mb-1">
            <h2 class="text-lg font-semibold text-gray-900">Scheduled Activities</h2>
            <button
              type="button"
              @click="addActivity"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus class="w-4 h-4" />
              Add Activity
            </button>
          </div>
          <p class="text-sm text-gray-500 mb-5">
            Define tasks that should be auto-created relative to the planting date. For example: "First Weeding" at 2 weeks after planting.
          </p>

          <!-- Empty State -->
          <div v-if="form.activities.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <CalendarClock class="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p class="text-sm text-gray-500 font-medium">No activities yet</p>
            <p class="text-xs text-gray-400 mt-1">Click "Add Activity" to start building your schedule</p>
          </div>

          <!-- Activities Table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">After</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Unit</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Priority</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    <span class="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="(activity, idx) in form.activities" :key="idx" class="group hover:bg-gray-50">
                  <!-- Row Number -->
                  <td class="px-4 py-3 align-top">
                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                      :class="priorityDotClass(activity.priority)"
                    >
                      {{ idx + 1 }}
                    </span>
                  </td>

                  <!-- Title -->
                  <td class="px-4 py-3 align-top">
                    <Input
                      v-model="activity.title"
                      type="text"
                      placeholder="e.g. First Weeding"
                      required
                      class="w-full"
                    />
                  </td>

                  <!-- Offset Value -->
                  <td class="px-4 py-3 align-top">
                    <input
                      v-model.number="activity.offset_value"
                      type="number"
                      min="1"
                      placeholder="2"
                      required
                      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </td>

                  <!-- Offset Unit -->
                  <td class="px-4 py-3 align-top">
                    <select
                      v-model="activity.offset_unit"
                      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </td>

                  <!-- Priority -->
                  <td class="px-4 py-3 align-top">
                    <select
                      v-model.number="activity.priority"
                      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option :value="1">Low</option>
                      <option :value="2">Medium</option>
                      <option :value="3">High</option>
                      <option :value="4">Critical</option>
                    </select>
                  </td>

                  <!-- Description -->
                  <td class="px-4 py-3 align-top">
                    <input type="hidden"  v-model="activity.id" />
                    <input
                      v-model="activity.description"
                      type="text"
                      placeholder="Optional notes"
                      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </td>

                  <!-- Remove -->
                  <td class="px-4 py-3 align-top text-right">
                    <button
                      type="button"
                      @click="removeActivity(idx)"
                      class="text-gray-300 hover:text-red-500 transition-colors group-hover:text-red-400"
                      title="Remove activity"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Inline Add Row -->
          <button
            v-if="form.activities.length > 0"
            type="button"
            @click="addActivity"
            class="mt-3 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-green-300 hover:text-green-600 transition-colors flex items-center justify-center gap-1"
          >
            <Plus class="w-4 h-4" />
            Add another activity
          </button>
        </div>

        <!-- Timeline Preview Card -->
        <div v-if="form.activities.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Timeline Preview</h2>
          <p class="text-sm text-gray-500 mb-5">Visual preview of how tasks will be scheduled after planting</p>

          <div class="relative">
            <!-- Timeline line -->
            <div class="absolute left-4 top-4 bottom-4 w-0.5 bg-green-200"></div>

            <!-- Planting start marker -->
            <div class="relative flex items-start gap-4 pb-5">
              <div class="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Sprout class="w-4 h-4" />
              </div>
              <div class="pt-1">
                <p class="text-sm font-semibold text-green-700">Planting Day</p>
                <p class="text-xs text-gray-400">Day 0</p>
              </div>
            </div>

            <!-- Activity markers -->
            <div
              v-for="(activity, idx) in sortedActivities"
              :key="idx"
              class="relative flex items-start gap-4 pb-5 last:pb-0"
            >
              <div
                class="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                :class="priorityDotClass(activity.priority)"
              >
                {{ activity.originalIndex + 1 }}
              </div>
              <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h5 class="text-sm font-medium text-gray-900">
                    {{ activity.title || 'Untitled' }}
                  </h5>
                  <div class="flex items-center gap-2">
                    <span :class="priorityBadgeClass(activity.priority)">
                      {{ priorityLabel(activity.priority) }}
                    </span>
                    <span class="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      <Clock class="w-3 h-3" />
                      {{ activity.offset_value }} {{ activity.offset_unit }}
                    </span>
                    <span class="text-xs text-gray-400">
                      (day {{ toDays(activity.offset_value, activity.offset_unit) }})
                    </span>
                  </div>
                </div>
                <p v-if="activity.description" class="text-xs text-gray-500 mt-1">{{ activity.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pb-8">
          <NuxtLink
            to="/admin/settings/crops/planting-schedules"
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
              <CalendarClock class="w-4 h-4 mr-2" />
              {{ isEditing ? 'Update Schedule' : 'Create Schedule' }}
            </span>
          </Button>
        </div>
      </form>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  ChevronLeft, Plus, Trash2, CalendarClock, Clock,
  Sprout, CheckCircle, AlertCircle
} from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

interface Activity {
  id?: number
  title: string
  offset_value: number
  offset_unit: 'days' | 'weeks' | 'months'
  priority: number
  description: string
}

interface Crop {
  id: number
  name: string
}

interface Schedule {
  id?: number
  uuid?: string
  name: string
  description: string
  crop_id: number | string
  crop?: Crop
  status: 'active' | 'inactive'
  activities: Activity[]
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const route = useRoute()
const router = useRouter()

const uuid = computed(() => route.params.uuid as string)
const isEditing = computed(() => uuid.value !== 'new')

// Data
const crops = ref<Crop[]>([])
const cropsLoading = ref(true)
const pageLoading = ref(false)
const submitting = ref(false)
const successMessage = ref<string | null>(null)
const generalError = ref<string | null>(null)

const form = ref({
  name: '',
  crop_id: '' as number | string,
  description: '',
  status: 'active' as 'active' | 'inactive',
  activities: [] as Activity[]
})

const defaultActivity = (): Activity => ({
  title: '',
  offset_value: 1,
  offset_unit: 'weeks',
  priority: 2,
  description: ''
})

const addActivity = () => {
  form.value.activities.push(defaultActivity())
}

const removeActivity = (idx: number) => {
  form.value.activities.splice(idx, 1)
}

const toDays = (value: number, unit: string) => {
  if (unit === 'weeks') return value * 7
  if (unit === 'months') return value * 30
  return value
}

const sortedActivities = computed(() => {
  return form.value.activities
    .map((a, i) => ({ ...a, originalIndex: i }))
    .sort((a, b) => toDays(a.offset_value, a.offset_unit) - toDays(b.offset_value, b.offset_unit))
})

const priorityLabel = (priority: number) => {
  const labels: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' }
  return labels[priority] || 'Medium'
}

const priorityBadgeClass = (priority: number) => {
  const classes: Record<number, string> = {
    1: 'px-1.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600',
    2: 'px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700',
    3: 'px-1.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700',
    4: 'px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700'
  }
  return classes[priority] || classes[2]
}

const priorityDotClass = (priority: number) => {
  const classes: Record<number, string> = {
    1: 'bg-gray-200 text-gray-600',
    2: 'bg-blue-200 text-blue-700',
    3: 'bg-amber-200 text-amber-700',
    4: 'bg-red-200 text-red-700'
  }
  return classes[priority] || classes[2]
}

// Fetch crops for the dropdown
const fetchCrops = async () => {
  cropsLoading.value = true
  try {
    if (isOnline.value) {
      const response = await $apiFetch<{ data: Crop[] }>('/api/v1/settings/crops/list')
      crops.value = response.data ?? (response as unknown as Crop[])
    }
  } catch (err) {
    console.error('Failed to fetch crops:', err)
  } finally {
    cropsLoading.value = false
  }
}

// Fetch existing schedule when editing
const fetchSchedule = async () => {
  if (!isEditing.value) return

  pageLoading.value = true
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Schedule }>(
        `/api/v1/settings/crops/schedules/${uuid.value}`
      )
      const schedule = response.data ?? (response as unknown as Schedule)
      form.value = {
        name: schedule.name,
        crop_id: schedule.crop_id || '',
        description: schedule.description || '',
        status: schedule.status,
        activities: (schedule.activities || []).map(a => ({
          id: a.id,
          title: a.title,
          offset_value: a.offset_value,
          offset_unit: a.offset_unit,
          priority: a.priority,
          description: a.description || ''
        }))
      }
    }
  } catch (err: any) {
    console.error('Failed to fetch schedule:', err)
    generalError.value = 'Failed to load schedule: ' + (err.message || 'Unknown error')
  } finally {
    pageLoading.value = false
  }
}

const handleSubmit = async () => {
  generalError.value = null
  successMessage.value = null
  submitting.value = true

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
    }

    const payload = {
      name: form.value.name,
      crop_id: form.value.crop_id || null,
      description: form.value.description,
      status: form.value.status,
      activities: form.value.activities.map((a, idx) => ({
        id: a.id,
        title: a.title,
        offset_value: a.offset_value,
        offset_unit: a.offset_unit,
        priority: a.priority,
        description: a.description,
        sort_order: idx + 1
      }))
    }

    if (isEditing.value) {
      if (isOnline.value) {
        await $apiFetch(`/api/v1/settings/crops/schedules/${uuid.value}`, {
          method: 'PUT',
          body: payload
        })
      }
      successMessage.value = 'Planting schedule updated successfully!'
    } else {
      if (isOnline.value) {
        const response = await $apiFetch<{ data?: { uuid?: string } }>(
          '/api/v1/settings/crops/schedules',
          { method: 'POST', body: payload }
        )
        const newUuid = response?.data?.uuid
        if (newUuid) {
          await router.push(`/admin/settings/crops/planting-schedule/${newUuid}`)
          successMessage.value = 'Planting schedule created successfully!'
          return
        }
      }
      successMessage.value = 'Planting schedule created successfully!'
      await router.push('/admin/settings/crops/planting-schedules')
    }
  } catch (err: any) {
    console.error('Failed to save schedule:', err)
    generalError.value = 'Failed to save schedule: ' + (err.message || 'Unknown error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCrops()
  fetchSchedule()
})
</script>
