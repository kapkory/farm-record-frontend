<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Livestock</h1>
      <div class="mt-3 sm:mt-0 flex gap-2">
        <NuxtLink
          to="/admin/livestock/add"
          class="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Animal
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <PawPrint class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Animals</p>
            <p class="text-xl font-bold text-gray-900">{{ totalCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Tag class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Individual</p>
            <p class="text-xl font-bold text-gray-900">{{ individualCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Groups</p>
            <p class="text-xl font-bold text-gray-900">{{ groupCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">Needs Attention</p>
            <p class="text-xl font-bold text-gray-900">{{ attentionCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, tag, breed, or group..."
            class="w-full"
          />
        </div>
        <select
          v-model="filterType"
          class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option v-for="type in animalTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select
          v-model="filterTracking"
          class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All (Individual & Group)</option>
          <option value="individual">Individual Only</option>
          <option value="group">Groups Only</option>
        </select>
        <select
          v-model="filterStatus"
          class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="deceased">Deceased</option>
          <option value="transferred">Transferred</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading livestock...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load livestock</p>
      <p class="text-sm mt-1">{{ loadError }}</p>
      <button @click="fetchAnimals" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Animal List -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Breed</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm</th>
              <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th> -->
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="animal in filteredAnimals"
              :key="animal.uuid"
              class="hover:bg-gray-50 cursor-pointer"
              @click="navigateTo(`/admin/livestock/animal/${animal.uuid}`)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div :class="[
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    animal.tracking_type === 'individual' ? 'bg-blue-100' : 'bg-purple-100'
                  ]">
                    <component
                      :is="animal.tracking_type === 'individual' ? Tag : Users"
                      :class="[
                        'w-4 h-4',
                        animal.tracking_type === 'individual' ? 'text-blue-600' : 'text-purple-600'
                      ]"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ animal.tracking_type === 'individual' ? animal.name : animal.group_name }}
                    </p>
                    <p v-if="animal.tag_number" class="text-xs text-gray-500">{{ animal.tag_number }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <p class="text-sm text-gray-900">{{ animal.animal_type?.name }}</p>
                <p class="text-xs text-gray-500">{{ animal.breed?.name }}</p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  animal.tracking_type === 'individual'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                ]">
                  {{ animal.tracking_type === 'individual' ? 'Individual' : 'Group' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ animal.count }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                {{ animal.purpose }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ animal.farm?.name || '-' }}
              </td>
              <!-- <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  animal.health_status === 'healthy' ? 'bg-green-100 text-green-800' :
                  animal.health_status === 'attention' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                ]">
                  {{ animal.health_status }}
                </span> -->
              <!-- </td> -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  animal.status === 'active' ? 'bg-green-100 text-green-800' :
                  animal.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                  animal.status === 'deceased' ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                ]">
                  {{ animal.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click.stop="navigateTo(`/admin/livestock/animal/${animal.uuid}`)"
                  class="text-green-600 hover:text-green-900 mr-3"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button
                  @click.stop="navigateTo(`/admin/livestock/animal/${animal.uuid}`)"
                  class="text-gray-600 hover:text-gray-900"
                  title="Edit"
                >
                  <Pencil class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredAnimals.length === 0">
              <td colspan="9" class="px-6 py-12 text-center">
                <PawPrint class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 font-medium">No animals found</p>
                <p class="text-sm text-gray-400 mt-1">
                  {{ searchQuery || filterType || filterTracking || filterStatus ? 'Try adjusting your filters' : 'Add your first animal to get started' }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { Plus, Eye, Pencil, PawPrint, Tag, Users, AlertTriangle } from 'lucide-vue-next'
import mockData from '~/data/animals.json'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

interface Animal {
  uuid: string
  farm_uuid: string
  farm: { uuid: string; name: string } | null
  animal_type: { id: number; name: string } | null
  breed: { id: number; name: string } | null
  tracking_type: 'individual' | 'group'
  tag_number: string | null
  name: string | null
  group_name: string | null
  count: number
  gender: string
  date_of_birth: string | null
  acquisition_date: string | null
  acquisition_type: string | null
  purpose: string
  status: 'active' | 'sold' | 'deceased' | 'transferred'
  notes: string | null
  last_checkup: string | null
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const animals = ref<Animal[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)

const searchQuery = ref('')
const filterType = ref('')
const filterTracking = ref('')
const filterStatus = ref('')

const animalTypes = computed(() => {
  const types = new Set(animals.value.map(a => a.animal_type?.name).filter(Boolean))
  return Array.from(types).sort()
})

// Stats
const totalCount = computed(() => animals.value.reduce((sum, a) => sum + a.count, 0))
const individualCount = computed(() => animals.value.filter(a => a.tracking_type === 'individual').length)
const groupCount = computed(() => animals.value.filter(a => a.tracking_type === 'group').length)

// Filtering
const filteredAnimals = computed(() => {
  return animals.value.filter(a => {
    if (filterType.value && a.animal_type?.name !== filterType.value) return false
    if (filterTracking.value && a.tracking_type !== filterTracking.value) return false
    if (filterStatus.value && a.status !== filterStatus.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const searchable = [
        a.name, a.group_name, a.tag_number, a.breed?.name, a.animal_type?.name
      ].filter(Boolean).join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })
})

const fetchAnimals = async () => {
  loading.value = true
  loadError.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Animal[] }>('/api/v1/farms/farm/animals/livestocks/list')
      animals.value = response.data || response as unknown as Animal[]
    } else {
      // animals.value = mockData.animals as Animal[]
    }
  } catch (err: any) {
    console.error('Failed to fetch animals:', err)
    // Fallback to mock data on error
    // animals.value = mockData.animals as Animal[]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnimals()
})
</script>
