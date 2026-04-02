<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading planting schedules...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load planting schedules</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchSchedules" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Planting Schedules</h3>
        <NuxtLink to="/admin/settings/crops/planting-schedule/new">
          <Button>
            <Plus class="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="schedule in schedules" :key="schedule.id ?? schedule.uuid">
              <!-- Schedule Row -->
              <tr class="hover:bg-gray-50 cursor-pointer" @click="toggleExpand(schedule.uuid)">
                <td class="px-6 py-4 whitespace-nowrap">
                  <ChevronRight
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{ 'rotate-90': expandedUuid === schedule.uuid }"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-medium text-gray-900">{{ schedule.name }}</p>
                  <p v-if="schedule.description" class="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{{ schedule.description }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-700">{{ schedule.crop?.name || '—' }}</span>
                  <span v-if="!schedule.crop_id" class="text-xs text-gray-400 italic ml-1">(generic)</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 text-sm text-gray-700">
                    <CalendarClock class="w-3.5 h-3.5 text-gray-400" />
                    {{ schedule.activities?.length || 0 }} task{{ (schedule.activities?.length || 0) === 1 ? '' : 's' }}
                  </span>
                  <span v-if="schedule.activities?.length" class="text-xs text-gray-400 ml-2">
                    ({{ totalDuration(schedule.activities) }})
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    schedule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ schedule.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" @click.stop>
                  <NuxtLink :to="`/admin/settings/crops/planting-schedule/${schedule.uuid}`" class="text-green-600 hover:text-green-900 mr-3" title="Edit">
                    <Pencil class="w-4 h-4 inline" />
                  </NuxtLink>
                  <button @click="deleteSchedule(schedule.uuid)" class="text-red-600 hover:text-red-900" title="Delete">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <!-- Expanded Activities Row -->
              <tr v-if="expandedUuid === schedule.uuid">
                <td colspan="6" class="px-0 py-0">
                  <div class="bg-gray-50 border-t border-gray-100">
                    <div v-if="schedule.activities?.length" class="px-8 py-4">
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity Timeline</p>
                      <div class="relative">
                        <div class="absolute left-3 top-3 bottom-3 w-0.5 bg-green-200"></div>

                        <div
                          v-for="(activity, idx) in schedule.activities"
                          :key="idx"
                          class="relative flex items-start gap-4 pb-4 last:pb-0"
                        >
                          <div class="relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            :class="priorityDotClass(activity.priority)"
                          >
                            {{ idx + 1 }}
                          </div>

                          <div class="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                            <div class="flex items-center justify-between">
                              <h5 class="text-sm font-medium text-gray-900">{{ activity.title }}</h5>
                              <div class="flex items-center gap-2">
                                <span :class="priorityBadgeClass(activity.priority)">
                                  {{ priorityLabel(activity.priority) }}
                                </span>
                                <span class="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                                  <Clock class="w-3 h-3" />
                                  {{ formatOffset(activity.offset_value, activity.offset_unit) }}
                                </span>
                              </div>
                            </div>
                            <p v-if="activity.description" class="text-xs text-gray-500 mt-1">{{ activity.description }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else class="px-8 py-6 text-center">
                      <p class="text-sm text-gray-400 italic">No activities defined for this schedule</p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="schedules.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No planting schedules found. Create your first schedule to auto-generate tasks when planting.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Plus, Pencil, Trash2, CalendarClock, ChevronRight, Clock } from 'lucide-vue-next'

interface Activity {
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

const schedules = ref<Schedule[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const expandedUuid = ref<string | null>(null)

const toggleExpand = (uuid?: string) => {
  if (!uuid) return
  expandedUuid.value = expandedUuid.value === uuid ? null : uuid
}

const formatOffset = (value: number, unit: string) => {
  if (!value) return ''
  return `${value} ${unit}`
}

const toDays = (value: number, unit: string) => {
  if (unit === 'weeks') return value * 7
  if (unit === 'months') return value * 30
  return value
}

const totalDuration = (activities: Activity[]) => {
  if (!activities.length) return ''
  const first = activities[0]!
  let maxDays = 0
  let maxVal = first.offset_value
  let maxUnit = first.offset_unit
  for (const a of activities) {
    const d = toDays(a.offset_value, a.offset_unit)
    if (d > maxDays) {
      maxDays = d
      maxVal = a.offset_value
      maxUnit = a.offset_unit
    }
  }
  return `spans ${maxVal} ${maxUnit}`
}

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

const fetchSchedules = async () => {
  loading.value = true
  error.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Schedule[] }>('/api/v1/settings/crops/schedules/list')
      schedules.value = response.data ?? (response as unknown as Schedule[])
    } else {
      schedules.value = []
    }
  } catch (err: any) {
    console.error('Failed to fetch planting schedules:', err)
    error.value = err.message || 'An error occurred while loading planting schedules'
    schedules.value = []
    error.value = null
  } finally {
    loading.value = false
  }
}

const deleteSchedule = async (uuid?: string) => {
  if (!uuid || !confirm('Are you sure you want to delete this planting schedule?')) return

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch(`/api/v1/settings/crops/schedules/${uuid}`, { method: 'DELETE' })
    }
    schedules.value = schedules.value.filter(s => s.uuid !== uuid)
  } catch (err: any) {
    console.error('Failed to delete schedule:', err)
    alert('Failed to delete planting schedule')
  }
}

onMounted(() => {
  fetchSchedules()
})
</script>
