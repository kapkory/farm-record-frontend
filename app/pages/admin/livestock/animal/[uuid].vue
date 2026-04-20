<template>
  <div class="p-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading animal details...</span>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load animal</p>
      <p class="text-sm mt-1">{{ loadError }}</p>
      <button @click="fetchAnimal" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Animal Detail -->
    <template v-else-if="animal">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="navigateTo('/admin/livestock')"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="flex items-center gap-3">
            <div :class="[
              'w-12 h-12 rounded-full flex items-center justify-center',
              animal.tracking_type === 'individual' ? 'bg-blue-100' : 'bg-purple-100'
            ]">
              <component
                :is="animal.tracking_type === 'individual' ? Tag : Users"
                :class="[
                  'w-6 h-6',
                  animal.tracking_type === 'individual' ? 'text-blue-600' : 'text-purple-600'
                ]"
              />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ animal.tracking_type === 'individual' ? animal.name : animal.group_name }}
              </h1>
              <div class="flex items-center gap-2 mt-1">
                <span :class="[
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  animal.tracking_type === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                ]">
                  {{ animal.tracking_type === 'individual' ? 'Individual' : 'Group' }}
                </span>
                <span v-if="animal.tag_number" class="text-sm text-gray-500">{{ animal.tag_number }}</span>
                <span :class="[
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  animal.health_status === 'healthy' ? 'bg-green-100 text-green-800' :
                  animal.health_status === 'attention' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                ]">
                  {{ animal.health_status }}
                </span>
                <span :class="[
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  animal.status === 'active' ? 'bg-green-100 text-green-800' :
                  animal.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                  animal.status === 'deceased' ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                ]">
                  {{ animal.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-2">
          <Button variant="outline" @click="editAnimal">
            <Pencil class="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" class="text-red-600 border-red-300 hover:bg-red-50" @click="confirmDelete">
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <!-- Info Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Basic Info Card -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Type</dt>
                <dd class="text-sm text-gray-900">{{ animal.animal_type?.name || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Breed</dt>
                <dd class="text-sm text-gray-900">{{ animal.breed?.name || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Gender</dt>
                <dd class="text-sm text-gray-900 capitalize">{{ animal.gender || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Purpose</dt>
                <dd class="text-sm text-gray-900 capitalize">{{ animal.purpose || '-' }}</dd>
              </div>
              <template v-if="animal.tracking_type === 'group'">
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase">Count</dt>
                  <dd class="text-sm font-semibold text-gray-900">{{ animal.count }}</dd>
                </div>
              </template>
            </dl>
          </CardContent>
        </Card>

        <!-- Physical / Identity Card -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">
              {{ animal.tracking_type === 'individual' ? 'Physical Details' : 'Group Details' }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="space-y-3">
              <template v-if="animal.tracking_type === 'individual'">
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase">Tag Number</dt>
                  <dd class="text-sm text-gray-900 font-mono">{{ animal.tag_number || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase">Date of Birth</dt>
                  <dd class="text-sm text-gray-900">{{ animal.date_of_birth ? formatDate(animal.date_of_birth) : '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase">Age</dt>
                  <dd class="text-sm text-gray-900">{{ animal.date_of_birth ? calculateAge(animal.date_of_birth) : '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase">Weight</dt>
                  <dd class="text-sm text-gray-900">{{ animal.weight_kg ? `${animal.weight_kg} kg` : '-' }}</dd>
                </div>
              </template>
              <template v-else>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase">Group Name</dt>
                  <dd class="text-sm text-gray-900">{{ animal.group_name }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase">Head Count</dt>
                  <dd class="text-sm text-gray-900 font-semibold">{{ animal.count }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase">Gender Composition</dt>
                  <dd class="text-sm text-gray-900 capitalize">{{ animal.gender || 'Mixed' }}</dd>
                </div>
              </template>
            </dl>
          </CardContent>
        </Card>

        <!-- Location & Acquisition Card -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Location & Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Farm</dt>
                <dd class="text-sm text-gray-900">{{ animal.farm?.name || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Location / Pen</dt>
                <dd class="text-sm text-gray-900">{{ animal.location || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Acquired On</dt>
                <dd class="text-sm text-gray-900">{{ animal.acquisition_date ? formatDate(animal.acquisition_date) : '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Acquisition</dt>
                <dd class="text-sm text-gray-900 capitalize">{{ animal.acquisition_type || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Last Checkup</dt>
                <dd class="text-sm text-gray-900">{{ animal.last_checkup ? formatDate(animal.last_checkup) : '-' }}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <!-- Notes -->
      <div v-if="animal.notes" class="mb-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ animal.notes }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Tabs: Health Records & Treatments -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'py-3 px-6 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <div class="p-4">
          <AnimalTransactionTab v-if="activeTab === 'overview'" :animal-uuid="uuid" :tracking-type="animal.tracking_type" />
          <AnimalTreatmentTab v-else-if="activeTab === 'treatments'" :animal-uuid="uuid" :tracking-type="animal.tracking_type" />
          <AnimalBreedingTab v-else-if="activeTab === 'breedings'" :animal-uuid="uuid" :tracking-type="animal.tracking_type" />
          <AnimalTaskTab v-else-if="activeTab === 'tasks'" :animal-uuid="uuid" :tracking-type="animal.tracking_type" />
          <div v-else class="text-center py-8">
            <Clock class="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Activity timeline coming soon</p>
            <p class="text-xs text-gray-400 mt-1">Weight changes, movements, and key events will appear here</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="showDeleteConfirm = false"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <Trash2 class="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Animal</h3>
            <p class="text-sm text-gray-500 mb-6">
              Are you sure you want to delete
              <strong>{{ animal?.tracking_type === 'individual' ? animal?.name : animal?.group_name }}</strong>?
              This action cannot be undone.
            </p>
            <div class="flex justify-center gap-3">
              <button
                @click="showDeleteConfirm = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                @click="deleteAnimal"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft, Tag, Users, Pencil, Trash2, Clock, X } from 'lucide-vue-next'
// import mockData from '~/data/animals.json'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

const route = useRoute()
const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const uuid = route.params.uuid as string

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
  weight_kg: number | null
  acquisition_date: string | null
  acquisition_type: string | null
  purpose: string
  status: string
  health_status: string
  location: string | null
  notes: string | null
  last_checkup: string | null
}

const animal = ref<Animal | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)
const activeTab = ref('overview')
const showDeleteConfirm = ref(false)

const tabs = [
  { key: 'overview', label: 'Transactions' },
  { key: 'treatments', label: 'Treatments' },
  { key: 'breedings', label: 'Breedings' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'activity', label: 'Activity' }
]

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const calculateAge = (dob: string) => {
  const birth = new Date(dob)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  if (years > 0) {
    return months < 0 ? `${years - 1}y ${12 + months}m` : `${years}y ${months}m`
  }
  return months <= 0 ? 'Less than a month' : `${months}m`
}

const editAnimal = () => {
  navigateTo(`/admin/livestock?edit=${uuid}`)
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const deleteAnimal = async () => {
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch(`/api/v1/livestock/${uuid}`, { method: 'DELETE' })
    }
    navigateTo('/admin/livestock')
  } catch (err: any) {
    console.error('Failed to delete animal:', err)
    alert('Failed to delete: ' + (err.message || 'Unknown error'))
  } finally {
    showDeleteConfirm.value = false
  }
}

const fetchAnimal = async () => {
  loading.value = true
  loadError.value = null

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data: Animal }>(`/api/v1/farms/farm/animals/livestocks/${uuid}`)
    animal.value = response.data || response as unknown as Animal
  } catch (err: any) {
    console.error('Failed to fetch animal:', err)
    loadError.value = err.message || 'Failed to load animal details'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnimal()
})
</script>
