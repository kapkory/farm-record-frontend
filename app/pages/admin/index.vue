<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Good {{ greeting }}, {{ authStore.currentFarmer?.name?.split(' ')[0] || 'there' }}
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Here's an overview of your farm operations.</p>
      </div>
      <div class="mt-3 sm:mt-0 flex items-center gap-2">
        <NuxtLink
          to="/admin/farms/add"
          class="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
        >
          <Plus class="h-4 w-4" />
          New Farm
        </NuxtLink>
        <NuxtLink
          to="/admin/farms/farm/new-planting"
          class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Sprout class="h-4 w-4" />
          New Planting
        </NuxtLink>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-500">{{ card.label }}</span>
          <div class="h-9 w-9 rounded-lg flex items-center justify-center" :class="card.iconBg">
            <component :is="card.icon" class="h-5 w-5" :class="card.iconColor" />
          </div>
        </div>
        <div class="mt-3">
          <p v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"></p>
          <p v-else class="text-2xl font-bold text-gray-900">{{ card.value }}</p>
        </div>
        <p class="mt-1 text-xs text-gray-400">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Active Plantings -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200">
        <div class="flex items-center justify-between p-5 pb-0">
          <h2 class="text-base font-semibold text-gray-900">Active Plantings</h2>
          <NuxtLink to="/admin/plantings" class="text-xs font-medium text-green-600 hover:text-green-700">
            View all
          </NuxtLink>
        </div>

        <div v-if="loading" class="p-5 space-y-3">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="plantings.length === 0" class="p-10 text-center">
          <Sprout class="h-10 w-10 text-gray-300 mx-auto" />
          <p class="mt-2 text-sm text-gray-500">No active plantings yet.</p>
          <NuxtLink
            to="/admin/farms/farm/new-planting"
            class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700"
          >
            <Plus class="h-4 w-4" /> Add your first planting
          </NuxtLink>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <NuxtLink
            v-for="p in plantings.slice(0, 5)"
            :key="p.uuid"
            :to="`/admin/farms/farm/planting/${p.uuid}`"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <div
              class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="statusStyle(p.status).bg"
            >
              <component :is="statusStyle(p.status).icon" class="h-4 w-4" :class="statusStyle(p.status).text" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ p.crop?.name || 'Unknown Crop' }}
                <span v-if="p.crop_variety" class="text-gray-400 font-normal">· {{ p.crop_variety.name }}</span>
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ p.farm?.name || '—' }}
                <span v-if="p.field">· {{ p.field.name }}</span>
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="statusStyle(p.status).badge"
              >
                {{ p.status }}
              </span>
              <p v-if="p.expected_harvest_date" class="text-xs text-gray-400 mt-0.5">
                Harvest {{ formatDate(p.expected_harvest_date) }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Tasks -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="flex items-center justify-between p-5 pb-0">
          <h2 class="text-base font-semibold text-gray-900">Pending Tasks</h2>
          <span
            v-if="!loading && pendingTasks.length > 0"
            class="text-xs font-medium text-orange-600 bg-orange-50 rounded-full px-2 py-0.5"
          >
            {{ pendingTasks.length }}
          </span>
        </div>

        <div v-if="loading" class="p-5 space-y-3">
          <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="tasks.length === 0" class="p-10 text-center">
          <CheckCircle2 class="h-10 w-10 text-gray-300 mx-auto" />
          <p class="mt-2 text-sm text-gray-500">No tasks yet.</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="t in pendingTasks.slice(0, 6)"
            :key="t.uuid"
            class="flex items-start gap-3 px-5 py-3"
          >
            <div
              class="mt-0.5 h-2 w-2 rounded-full shrink-0"
              :class="priorityColor(t.priority)"
            ></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 truncate">{{ t.title }}</p>
              <p v-if="t.due_date" class="text-xs text-gray-400">
                Due {{ formatDate(t.due_date) }}
              </p>
            </div>
            <span
              class="text-xs font-medium rounded-full px-2 py-0.5 shrink-0"
              :class="taskStatusBadge(t.task_status)"
            >
              {{ taskStatusLabel(t.task_status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Farms List -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="flex items-center justify-between p-5 pb-0">
          <h2 class="text-base font-semibold text-gray-900">Your Farms</h2>
          <NuxtLink to="/admin/farms" class="text-xs font-medium text-green-600 hover:text-green-700">
            Manage
          </NuxtLink>
        </div>

        <div v-if="loading" class="p-5 space-y-3">
          <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="farms.length === 0" class="p-10 text-center">
          <MapPin class="h-10 w-10 text-gray-300 mx-auto" />
          <p class="mt-2 text-sm text-gray-500">No farms registered yet.</p>
          <NuxtLink
            to="/admin/farms/add"
            class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700"
          >
            <Plus class="h-4 w-4" /> Add a farm
          </NuxtLink>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <NuxtLink
            v-for="f in farms.slice(0, 5)"
            :key="f.uuid"
            :to="`/admin/farms/farm/${f.uuid}`"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <div class="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Landmark class="h-5 w-5 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ f.name }}</p>
              <p class="text-xs text-gray-500">
                {{ f.location || '—' }} · {{ f.size }} {{ f.size_unit || 'acres' }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs text-gray-500">{{ f.total_plantings ?? 0 }} plantings</p>
              <span
                class="inline-block mt-0.5 h-1.5 w-1.5 rounded-full"
                :class="f.status === 'active' ? 'bg-green-400' : 'bg-gray-300'"
              ></span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Planting Status Breakdown -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-base font-semibold text-gray-900 mb-5">Planting Status</h2>

        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-8 bg-gray-100 rounded animate-pulse"></div>
        </div>

        <div v-else-if="plantings.length === 0" class="py-8 text-center">
          <p class="text-sm text-gray-400">No planting data available.</p>
        </div>

        <div v-else class="space-y-5">
          <div v-for="s in plantingBreakdown" :key="s.status">
            <div class="flex items-center justify-between text-sm mb-1.5">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full" :class="s.dot"></span>
                <span class="font-medium text-gray-700 capitalize">{{ s.status }}</span>
              </div>
              <span class="text-gray-500">{{ s.count }}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="s.bar"
                :style="{ width: plantings.length ? (s.count / plantings.length * 100) + '%' : '0%' }"
              ></div>
            </div>
          </div>

          <!-- Crop distribution -->
          <div class="border-t border-gray-100 pt-5 mt-5">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Top Crops</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="c in topCrops"
                :key="c.name"
                class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {{ c.name }}
                <span class="text-gray-400">{{ c.count }}</span>
              </span>
              <span v-if="topCrops.length === 0" class="text-xs text-gray-400">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Plus,
  Sprout,
  Landmark,
  MapPin,
  CheckCircle2,
  Warehouse,
  ListTodo,
  Users,
  Leaf,
  Timer,
  CircleCheck,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
})

const { $apiFetch } = useNuxtApp()
const authStore = useAuthStore()

const loading = ref(true)
const farms = ref([])
const plantings = ref([])
const tasks = ref([])

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

// --- Stat cards ---
const statCards = computed(() => [
  {
    label: 'Farms',
    value: farms.value.length,
    sub: `${farms.value.filter(f => f.status === 'active').length} active`,
    icon: Warehouse,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    label: 'Active Plantings',
    value: plantings.value.filter(p => p.status === 'growing').length,
    sub: `${plantings.value.length} total`,
    icon: Sprout,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Pending Tasks',
    value: pendingTasks.value.length,
    sub: `${tasks.value.length} total`,
    icon: ListTodo,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    label: 'Team',
    value: farms.value.reduce((sum, f) => sum + (f.total_personnels ?? 0), 0) || '—',
    sub: 'across all farms',
    icon: Users,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
])

// --- Computed helpers ---
const pendingTasks = computed(() =>
  tasks.value.filter(t => t.task_status !== 5) // 5 = completed
)

const plantingBreakdown = computed(() => {
  const counts = { growing: 0, harvesting: 0, completed: 0 }
  plantings.value.forEach(p => {
    if (counts[p.status] !== undefined) counts[p.status]++
  })
  return [
    { status: 'growing', count: counts.growing, dot: 'bg-green-400', bar: 'bg-green-400' },
    { status: 'harvesting', count: counts.harvesting, dot: 'bg-yellow-400', bar: 'bg-yellow-400' },
    { status: 'completed', count: counts.completed, dot: 'bg-gray-400', bar: 'bg-gray-400' },
  ]
})

const topCrops = computed(() => {
  const map = {}
  plantings.value.forEach(p => {
    const name = p.crop?.name
    if (name) map[name] = (map[name] || 0) + 1
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))
})

// --- Status styling ---
function statusStyle(status) {
  const map = {
    growing: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-50 text-green-700', icon: Leaf },
    harvesting: { bg: 'bg-yellow-100', text: 'text-yellow-600', badge: 'bg-yellow-50 text-yellow-700', icon: Timer },
    completed: { bg: 'bg-gray-100', text: 'text-gray-500', badge: 'bg-gray-100 text-gray-600', icon: CircleCheck },
  }
  return map[status] || map.growing
}

function priorityColor(priority) {
  const map = { 1: 'bg-red-500', 2: 'bg-orange-400', 3: 'bg-yellow-400', 4: 'bg-gray-300' }
  return map[priority] || 'bg-gray-300'
}

function taskStatusLabel(status) {
  const map = { 1: 'Open', 2: 'In Progress', 3: 'Review', 4: 'Blocked', 5: 'Done' }
  return map[status] || 'Open'
}

function taskStatusBadge(status) {
  const map = {
    1: 'bg-blue-50 text-blue-600',
    2: 'bg-yellow-50 text-yellow-700',
    3: 'bg-purple-50 text-purple-600',
    4: 'bg-red-50 text-red-600',
    5: 'bg-green-50 text-green-600',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// --- Data fetching ---
async function fetchDashboardData() {
  loading.value = true
  try {
    const [farmsRes, plantingsRes, tasksRes] = await Promise.all([
      $apiFetch('/api/v1/farms').catch(() => ({ data: [] })),
      $apiFetch('/api/v1/farms/farm/plantings/').catch(() => ({ data: [] })),
      $apiFetch('/api/v1/tasks/list').catch(() => ({ data: [] })),
    ])
    farms.value = farmsRes?.data ?? farmsRes ?? []
    plantings.value = plantingsRes?.data ?? plantingsRes ?? []
    tasks.value = tasksRes?.data ?? tasksRes ?? []
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboardData)

useHead({
  title: 'Dashboard — Farmconsul',
})
</script>
