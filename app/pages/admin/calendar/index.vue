<template>
  <div class="space-y-4">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Task Calendar</h1>
        <p class="text-gray-500 mt-0.5 text-sm">View and manage farm tasks by date.</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- View Toggle -->
        <div class="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            v-for="v in views"
            :key="v.key"
            @click="activeView = v.key"
            :class="[
              'px-3 py-1.5 font-medium transition-colors',
              activeView === v.key
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            ]"
          >
            {{ v.key === 'month' ? currentMonthName : v.label }}
          </button>
        </div>
        <button
          @click="openAddTask"
          class="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Task
        </button>
      </div>
    </div>

    <div v-if="calendarError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ calendarError }}
    </div>
    <div v-else-if="loadingCalendar" class="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
      Loading calendar tasks...
    </div>

    <!-- Calendar Shell -->
    <div class="flex flex-col xl:flex-row gap-4">
      <div class="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden min-w-0">

        <!-- Shared Nav Bar -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button @click="navigatePrev" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex items-center gap-3">
            <h2 class="text-base font-semibold text-gray-900">{{ navTitle }}</h2>
            <button
              @click="goToToday"
              class="text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
          </div>
          <button @click="navigateNext" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- ── MONTH VIEW ─────────────────────────────────────────────────── -->
        <template v-if="activeView === 'month'">
          <div class="grid grid-cols-7 border-b border-gray-100">
            <div
              v-for="day in dayNames"
              :key="day"
              class="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7">
            <div
              v-for="(cell, index) in calendarCells"
              :key="index"
              :class="[
                'min-h-[96px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors',
                cell.day ? 'hover:bg-green-50/60' : 'bg-gray-50',
                cell.isToday && activeView === 'month' ? 'bg-green-50/40' : '',
                cell.isSelected ? 'ring-2 ring-inset ring-green-400' : '',
                (index + 1) % 7 === 0 ? 'border-r-0' : '',
              ]"
              @click="cell.day && selectDate(cell.dateStr)"
            >
              <div v-if="cell.day" class="flex items-center justify-between mb-1">
                <span
                  :class="[
                    'text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full',
                    cell.isToday ? 'bg-green-500 text-white' : 'text-gray-700',
                  ]"
                >{{ cell.day }}</span>
                <span v-if="getTasksForDate(cell.dateStr).length > 2" class="text-xs text-gray-400">
                  +{{ getTasksForDate(cell.dateStr).length - 2 }}
                </span>
              </div>
              <div v-if="cell.day" class="space-y-0.5">
                <div
                  v-for="task in getTasksForDate(cell.dateStr).slice(0, 2)"
                  :key="task.uuid"
                  :class="['text-xs px-1.5 py-0.5 rounded truncate font-medium border', categoryPill(task.category ?? '')]"
                >
                  {{ task.title }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── WEEK VIEW ──────────────────────────────────────────────────── -->
        <template v-else-if="activeView === 'week'">
          <!-- Day headers -->
          <div class="grid grid-cols-7 border-b border-gray-100">
            <div
              v-for="day in weekDays"
              :key="day.dateStr"
              @click="selectDate(day.dateStr)"
              :class="[
                'py-3 text-center cursor-pointer hover:bg-green-50/60 transition-colors border-r border-gray-100 last:border-r-0',
                day.isToday ? 'bg-green-50/40' : '',
                day.isSelected ? 'bg-green-50' : '',
              ]"
            >
              <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">{{ day.shortName }}</p>
              <span
                :class="[
                  'mt-1 text-lg font-semibold w-9 h-9 flex items-center justify-center rounded-full mx-auto',
                  day.isToday ? 'bg-green-500 text-white' : 'text-gray-800',
                ]"
              >{{ day.dayNum }}</span>
              <p class="text-xs text-gray-400 mt-0.5">{{ getTasksForDate(day.dateStr).length }} task{{ getTasksForDate(day.dateStr).length === 1 ? '' : 's' }}</p>
            </div>
          </div>
          <!-- Day columns -->
          <div class="grid grid-cols-7 divide-x divide-gray-100">
            <div
              v-for="day in weekDays"
              :key="day.dateStr + '-col'"
              class="min-h-[300px] p-2 space-y-1.5"
            >
              <div
                v-for="task in getTasksForDate(day.dateStr)"
                :key="task.uuid"
                @click="selectDate(day.dateStr)"
                :class="[
                  'rounded-md p-1.5 cursor-pointer hover:opacity-80 transition-opacity',
                  categorySurface(task.category ?? ''),
                ]"
              >
                <p :class="['text-xs font-medium leading-tight truncate', categoryText(task.category ?? ''), task.status === 'completed' ? 'line-through opacity-60' : '']">
                  {{ task.title }}
                </p>
              </div>
              <p v-if="getTasksForDate(day.dateStr).length === 0" class="text-xs text-gray-300 text-center pt-4">—</p>
            </div>
          </div>
        </template>

        <!-- ── DAY VIEW ───────────────────────────────────────────────────── -->
        <template v-else>
          <!-- All-day tasks -->
          <div v-if="allDayTasks.length" class="border-b border-gray-100 px-4 py-2.5 bg-gray-50/60">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">All day</p>
            <div class="flex flex-wrap gap-1.5">
              <div
                v-for="task in allDayTasks"
                :key="task.uuid"
                :class="['text-xs px-2.5 py-1 rounded-full font-medium border', categoryPill(task.category ?? '')]"
              >
                {{ task.title }}
              </div>
            </div>
          </div>

          <!-- Hourly timeline -->
          <div class="overflow-y-auto max-h-[640px]">
            <div
              v-for="slot in hourSlots"
              :key="slot.hour"
              class="flex border-b border-gray-50 last:border-b-0 min-h-[52px]"
            >
              <!-- Time label -->
              <div class="w-16 flex-shrink-0 px-3 pt-2">
                <span class="text-xs text-gray-400 font-medium">{{ slot.label }}</span>
              </div>
              <!-- Tasks at this hour -->
              <div class="flex-1 px-2 py-1 space-y-1 border-l border-gray-100">
                <div
                  v-for="task in getTasksForHour(slot.hour)"
                  :key="task.uuid"
                  :class="[
                    'rounded-md px-2.5 py-1.5 flex items-start gap-2',
                    categorySurface(task.category ?? ''),
                  ]"
                >
                  <button
                    @click="toggleTaskStatus(task)"
                    :class="[
                      'mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                      task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-white/70 hover:border-white',
                    ]"
                  >
                    <svg v-if="task.status === 'completed'" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </button>
                  <div class="min-w-0 flex-1">
                    <p :class="['text-xs font-semibold leading-tight', categoryText(task.category ?? ''), task.status === 'completed' ? 'line-through opacity-60' : '']">
                      {{ task.title }}
                    </p>
                    <p v-if="task.assignee" class="text-xs opacity-70 mt-0.5" :class="categoryText(task.category ?? '')">{{ task.assignee }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>

      <!-- ── SIDE PANEL ──────────────────────────────────────────────────── -->
      <div class="xl:w-72 bg-white rounded-xl border border-gray-200 flex flex-col min-h-[400px]">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">{{ selectedDateLabel }}</h3>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ selectedDayTasks.length }} task{{ selectedDayTasks.length === 1 ? '' : 's' }} scheduled
          </p>
        </div>

        <div class="flex-1 overflow-y-auto divide-y divide-gray-50">
          <div v-if="selectedDayTasks.length === 0" class="flex flex-col items-center justify-center py-10 text-center px-4">
            <svg class="w-10 h-10 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="text-sm text-gray-400">No tasks for this day.</p>
            <button @click="openAddTask" class="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">+ Add a task</button>
          </div>

          <div
            v-for="task in selectedDayTasks"
            :key="task.uuid"
            class="px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start gap-2.5">
              <button
                @click="toggleTaskStatus(task)"
                :class="[
                  'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                  task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400',
                ]"
              >
                <svg v-if="task.status === 'completed'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
              <div class="flex-1 min-w-0">
                <p :class="['text-sm font-medium text-gray-900', task.status === 'completed' ? 'line-through text-gray-400' : '']">
                  {{ task.title }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5 truncate">{{ task.description }}</p>
                <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', priorityPill(task.priority ?? '')]">{{ task.priority }}</span>
                  <span :class="['text-xs px-2 py-0.5 rounded-full font-medium border', categoryPill(task.category ?? '')]">{{ task.category }}</span>
                  <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', statusPill(task.status ?? '')]">{{ formatStatus(task.status ?? '') }}</span>
                </div>
                <p v-if="task.assignee" class="text-xs text-gray-400 mt-1">{{ task.assignee }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming strip -->
        <div class="border-t border-gray-100 px-4 py-3">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Next 7 days</p>
          <div class="space-y-1.5">
            <div v-for="task in upcomingTasks" :key="task.uuid" class="flex items-center gap-2">
              <span :class="['w-2 h-2 rounded-full flex-shrink-0', categoryDot(task.category ?? '')]"></span>
              <span class="text-xs text-gray-700 truncate flex-1">{{ task.title }}</span>
              <span class="text-xs text-gray-400 flex-shrink-0">{{ task.date ? formatShortDate(task.date) : 'No date' }}</span>
            </div>
            <p v-if="upcomingTasks.length === 0" class="text-xs text-gray-400">No upcoming tasks.</p>
          </div>
        </div>

        <div class="border-t border-gray-100 px-4 py-3">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Unscheduled</p>
          <div class="space-y-2">
            <div v-for="task in unscheduledTasks" :key="task.uuid" class="rounded-lg border border-gray-100 px-3 py-2">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-gray-900 truncate">{{ task.title }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ task.description }}</p>
                </div>
                <span :class="['text-[10px] px-2 py-0.5 rounded-full font-medium border', categoryPill(task.category ?? '')]">{{ task.category }}</span>
              </div>
            </div>
            <p v-if="unscheduledTasks.length === 0" class="text-xs text-gray-400">No unscheduled tasks.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
      <span class="font-medium text-gray-600">Category:</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block"></span>Planting</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-100 border border-amber-200 inline-block"></span>Animal</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-indigo-100 border border-indigo-200 inline-block"></span>AnimalGroup</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
})

const { $apiFetch } = useNuxtApp()

// ─── Types ────────────────────────────────────────────────────────────────────
interface CalendarApiTask {
  uuid: string
  title: string
  description: string | null
  date: string | null
  priority: string | null
  category: string | null
  status: string | null
  assignee: string | null
}

// ─── State ─────────────────────────────────────────────────────────────────────
const allTasks = ref<CalendarApiTask[]>([])
const loadingCalendar = ref(false)
const calendarError = ref<string | null>(null)

// ─── View state ───────────────────────────────────────────────────────────────
type ViewKey = 'month' | 'week' | 'day'
const views: { key: ViewKey; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'week',  label: 'Week'  },
  { key: 'day',   label: 'Day'   },
]
const activeView = ref<ViewKey>('month')

// ─── Shared date state ────────────────────────────────────────────────────────
// currentDate drives nav (month start / week start / day)
const currentDate = ref(new Date())
const selectedDate = ref<string>(toDateStr(new Date()))
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Current month name for the view toggle button
const currentMonthName = computed(() =>
  currentDate.value.toLocaleString('default', { month: 'long' })
)

// ─── Nav title ────────────────────────────────────────────────────────────────
const navTitle = computed(() => {
  if (activeView.value === 'month') {
    return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
  }
  if (activeView.value === 'week') {
    const start = weekStart.value
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleString('default', { month: 'short' })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
    }
    return `${start.toLocaleString('default', { month: 'short', day: 'numeric' })} – ${end.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  // day
  return currentDate.value.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigatePrev() {
  const d = new Date(currentDate.value)
  if (activeView.value === 'month')     { d.setDate(1); d.setMonth(d.getMonth() - 1) }
  else if (activeView.value === 'week') { d.setDate(d.getDate() - 7) }
  else                                  { d.setDate(d.getDate() - 1) }
  currentDate.value = d
  if (activeView.value === 'day') selectedDate.value = toDateStr(d)
}

function navigateNext() {
  const d = new Date(currentDate.value)
  if (activeView.value === 'month')     { d.setDate(1); d.setMonth(d.getMonth() + 1) }
  else if (activeView.value === 'week') { d.setDate(d.getDate() + 7) }
  else                                  { d.setDate(d.getDate() + 1) }
  currentDate.value = d
  if (activeView.value === 'day') selectedDate.value = toDateStr(d)
}

function goToToday() {
  currentDate.value = new Date()
  selectedDate.value = toDateStr(new Date())
}

function selectDate(dateStr: string) {
  selectedDate.value = dateStr
  // Sync currentDate to keep nav in same period
  const d = new Date(dateStr + 'T00:00:00')
  if (activeView.value === 'month') {
    currentDate.value = new Date(d.getFullYear(), d.getMonth(), 1)
  } else {
    currentDate.value = d
  }
}

// ─── MONTH helpers ────────────────────────────────────────────────────────────
const calendarCells = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = toDateStr(new Date())
  const cells: { day: number | null; dateStr: string; isToday: boolean; isSelected: boolean }[] = []

  for (let i = 0; i < firstDay; i++) cells.push({ day: null, dateStr: '', isToday: false, isSelected: false })
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ day, dateStr, isToday: dateStr === todayStr, isSelected: dateStr === selectedDate.value })
  }
  const remainder = cells.length % 7
  if (remainder !== 0) for (let i = 0; i < 7 - remainder; i++) cells.push({ day: null, dateStr: '', isToday: false, isSelected: false })
  return cells
})

// ─── WEEK helpers ─────────────────────────────────────────────────────────────
const weekStart = computed(() => {
  const d = new Date(currentDate.value)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay()) // back to Sunday
  return d
})

const weekDays = computed(() => {
  const todayStr = toDateStr(new Date())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + i)
    const dateStr = toDateStr(d)
    return {
      shortName: dayNames[i],
      dayNum: d.getDate(),
      dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate.value,
    }
  })
})

// ─── DAY helpers ──────────────────────────────────────────────────────────────
const HOUR_START = 5
const HOUR_END = 21

const hourSlots = computed(() =>
  Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => {
    const h = HOUR_START + i
    const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
    return { hour: h, label }
  })
)

const allDayTasks = computed(() =>
  getTasksForDate(selectedDate.value)
)

const unscheduledTasks = computed(() =>
  allTasks.value.filter(task => !task.date)
)

function getTasksForHour(_hour: number): CalendarApiTask[] {
  return []
}

// ─── Shared task helpers ─────────────────────────────────────────────────────
function getTasksForDate(dateStr: string) {
  return allTasks.value.filter(t => t.date === dateStr)
}

const selectedDayTasks = computed(() =>
  getTasksForDate(selectedDate.value).sort((a, b) => a.title.localeCompare(b.title))
)

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return 'Select a day'
  const dt = new Date(selectedDate.value + 'T00:00:00')
  return dt.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })
})

const upcomingTasks = computed(() => {
  const start = new Date(); start.setDate(start.getDate() + 1)
  const end   = new Date(); end.setDate(end.getDate() + 7)
  return allTasks.value
    .filter((t): t is CalendarApiTask & { date: string } => {
      if (!t.date) return false
      const dt = new Date(t.date + 'T00:00:00')
      return dt >= start && dt <= end && t.status !== 'completed'
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)
})

async function fetchCalendarTasks() {
  try {
    loadingCalendar.value = true
    calendarError.value = null
    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data: CalendarApiTask[] }>('/api/v1/tasks/calendar')
    const tasks = Array.isArray(response) ? response : (response?.data ?? [])
    allTasks.value = tasks
  } catch (error) {
    console.error('Failed to fetch calendar tasks', error)
    calendarError.value = 'Unable to load calendar tasks right now.'
  } finally {
    loadingCalendar.value = false
  }
}

onMounted(() => {
  fetchCalendarTasks()
})

function toggleTaskStatus(task: CalendarApiTask) {
  task.status = task.status === 'completed' ? 'pending' : 'completed'
}

function openAddTask() {
  alert('Add task form coming soon.')
}

// ─── Styling helpers ──────────────────────────────────────────────────────────
function priorityPill(p: string) {
  if (p === 'critical') return 'bg-rose-100 text-rose-700 border border-rose-200'
  if (p === 'high')   return 'bg-red-100 text-red-700 border border-red-200'
  if (p === 'medium') return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  return 'bg-blue-100 text-blue-700 border border-blue-200'
}

function normalizeCategory(category: string) {
  return category.toLowerCase().replace(/\s+/g, '')
}

function categoryPill(category: string) {
  const normalized = normalizeCategory(category)
  if (normalized === 'planting') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (normalized === 'animal') return 'bg-amber-100 text-amber-700 border-amber-200'
  if (normalized === 'animalgroup') return 'bg-indigo-100 text-indigo-700 border-indigo-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

function categorySurface(category: string) {
  const normalized = normalizeCategory(category)
  if (normalized === 'planting') return 'bg-emerald-50'
  if (normalized === 'animal') return 'bg-amber-50'
  if (normalized === 'animalgroup') return 'bg-indigo-50'
  return 'bg-slate-50'
}

function categoryText(category: string) {
  const normalized = normalizeCategory(category)
  if (normalized === 'planting') return 'text-emerald-800'
  if (normalized === 'animal') return 'text-amber-800'
  if (normalized === 'animalgroup') return 'text-indigo-800'
  return 'text-slate-800'
}

function categoryDot(category: string) {
  const normalized = normalizeCategory(category)
  if (normalized === 'planting') return 'bg-emerald-500'
  if (normalized === 'animal') return 'bg-amber-500'
  if (normalized === 'animalgroup') return 'bg-indigo-500'
  return 'bg-slate-400'
}

function statusPill(status: string) {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'on_hold') return 'bg-amber-100 text-amber-700'
  if (status === 'in-progress' || status === 'in_progress') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function formatShortDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' })
}
</script>
