<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Livestock</h1>
      <div class="mt-3 sm:mt-0 flex gap-2">
        <Button @click="openAddModal">
          <Plus class="w-4 h-4 mr-2" />
          Add Animal
        </Button>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
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
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  animal.health_status === 'healthy' ? 'bg-green-100 text-green-800' :
                  animal.health_status === 'attention' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                ]">
                  {{ animal.health_status }}
                </span>
              </td>
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
                <button @click.stop="editAnimal(animal)" class="text-gray-600 hover:text-gray-900">
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

    <!-- Add/Edit Animal Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? 'Edit Animal' : 'Add Animal' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="submitForm" class="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <!-- Tracking Type -->
              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-2">Tracking Type *</Label>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.tracking_type" value="individual" class="text-green-500 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">Individual Animal</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.tracking_type" value="group" class="text-green-500 focus:ring-green-500" />
                    <span class="text-sm text-gray-700">Group / Flock</span>
                  </label>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- Animal Type -->
                <div>
                  <Label for="animal_type" class="block text-sm font-medium text-gray-700 mb-1">Animal Type *</Label>
                  <select
                    id="animal_type"
                    v-model="form.animal_type_name"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option v-for="type in animalTypes" :key="type" :value="type">{{ type }}</option>
                  </select>
                </div>

                <!-- Breed -->
                <div>
                  <Label for="breed" class="block text-sm font-medium text-gray-700 mb-1">Breed *</Label>
                  <select
                    id="breed"
                    v-model="form.breed_name"
                    required
                    :disabled="!form.animal_type_name"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select breed</option>
                    <option v-for="breed in filteredBreeds" :key="breed" :value="breed">{{ breed }}</option>
                  </select>
                </div>
              </div>

              <!-- Individual fields -->
              <template v-if="form.tracking_type === 'individual'">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</Label>
                    <Input id="name" v-model="form.name" type="text" placeholder="Animal name" required class="w-full" />
                  </div>
                  <div>
                    <Label for="tag_number" class="block text-sm font-medium text-gray-700 mb-1">Tag Number *</Label>
                    <Input id="tag_number" v-model="form.tag_number" type="text" placeholder="e.g. GV-C001" required class="w-full" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label for="gender" class="block text-sm font-medium text-gray-700 mb-1">Gender *</Label>
                    <select
                      id="gender"
                      v-model="form.gender"
                      required
                      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <Label for="date_of_birth" class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</Label>
                    <Input id="date_of_birth" v-model="form.date_of_birth" type="date" class="w-full" />
                  </div>
                </div>
                <div>
                  <Label for="weight_kg" class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</Label>
                  <Input id="weight_kg" v-model.number="form.weight_kg" type="number" placeholder="Weight in kg" min="0" class="w-full" />
                </div>
              </template>

              <!-- Group fields -->
              <template v-if="form.tracking_type === 'group'">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label for="group_name" class="block text-sm font-medium text-gray-700 mb-1">Group Name *</Label>
                    <Input id="group_name" v-model="form.group_name" type="text" placeholder="e.g. Merino Flock A" required class="w-full" />
                  </div>
                  <div>
                    <Label for="count" class="block text-sm font-medium text-gray-700 mb-1">Count *</Label>
                    <Input id="count" v-model.number="form.count" type="number" placeholder="Number of animals" required min="1" class="w-full" />
                  </div>
                </div>
                <div>
                  <Label for="gender_group" class="block text-sm font-medium text-gray-700 mb-1">Gender</Label>
                  <select
                    id="gender_group"
                    v-model="form.gender"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="male">All Male</option>
                    <option value="female">All Female</option>
                  </select>
                </div>
              </template>

              <!-- Common fields -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="purpose" class="block text-sm font-medium text-gray-700 mb-1">Purpose *</Label>
                  <select
                    id="purpose"
                    v-model="form.purpose"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select purpose</option>
                    <option value="meat">Meat</option>
                    <option value="dairy">Dairy</option>
                    <option value="wool">Wool</option>
                    <option value="eggs">Eggs</option>
                    <option value="breeding">Breeding</option>
                    <option value="beef">Beef</option>
                    <option value="dual">Dual Purpose</option>
                  </select>
                </div>
                <div>
                  <Label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location / Pen</Label>
                  <Input id="location" v-model="form.location" type="text" placeholder="e.g. Paddock A" class="w-full" />
                </div>
              </div>

              <div>
                <Label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</Label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  rows="2"
                  placeholder="Additional notes..."
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting" class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </span>
                  <span v-else>{{ isEditing ? 'Update' : 'Add' }} Animal</span>
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
import { Plus, Eye, Pencil, PawPrint, Tag, Users, AlertTriangle, X } from 'lucide-vue-next'
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
  weight_kg: number | null
  acquisition_date: string | null
  acquisition_type: string | null
  purpose: string
  status: 'active' | 'sold' | 'deceased' | 'transferred'
  health_status: 'healthy' | 'attention' | 'critical'
  location: string | null
  notes: string | null
  last_checkup: string | null
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const animals = ref<Animal[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingUuid = ref<string | null>(null)

const searchQuery = ref('')
const filterType = ref('')
const filterTracking = ref('')
const filterStatus = ref('')

const animalTypes = computed(() => {
  const types = new Set(animals.value.map(a => a.animal_type?.name).filter(Boolean))
  return Array.from(types).sort()
})

const breedsByType = computed(() => {
  const map: Record<string, string[]> = {}
  for (const a of mockData.animalBreeds) {
    const typeName = a.animal_type?.name
    if (typeName) {
      if (!map[typeName]) map[typeName] = []
      if (!map[typeName].includes(a.name)) map[typeName].push(a.name)
    }
  }
  return map
})

const filteredBreeds = computed(() => {
  return breedsByType.value[form.value.animal_type_name] || []
})

// Stats
const totalCount = computed(() => animals.value.reduce((sum, a) => sum + a.count, 0))
const individualCount = computed(() => animals.value.filter(a => a.tracking_type === 'individual').length)
const groupCount = computed(() => animals.value.filter(a => a.tracking_type === 'group').length)
const attentionCount = computed(() => animals.value.filter(a => a.health_status === 'attention' || a.health_status === 'critical').length)

// Filtering
const filteredAnimals = computed(() => {
  return animals.value.filter(a => {
    if (filterType.value && a.animal_type?.name !== filterType.value) return false
    if (filterTracking.value && a.tracking_type !== filterTracking.value) return false
    if (filterStatus.value && a.status !== filterStatus.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const searchable = [
        a.name, a.group_name, a.tag_number, a.breed?.name, a.animal_type?.name, a.location
      ].filter(Boolean).join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })
})

const form = ref({
  tracking_type: 'individual' as 'individual' | 'group',
  animal_type_name: '',
  breed_name: '',
  name: '',
  tag_number: '',
  group_name: '',
  count: 1,
  gender: '' as string,
  date_of_birth: '',
  weight_kg: '' as number | '',
  purpose: '',
  location: '',
  notes: ''
})

const resetForm = () => {
  form.value = {
    tracking_type: 'individual',
    animal_type_name: '',
    breed_name: '',
    name: '',
    tag_number: '',
    group_name: '',
    count: 1,
    gender: '',
    date_of_birth: '',
    weight_kg: '',
    purpose: '',
    location: '',
    notes: ''
  }
  isEditing.value = false
  editingUuid.value = null
}

const openAddModal = () => {
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const editAnimal = (animal: Animal) => {
  isEditing.value = true
  editingUuid.value = animal.uuid
  form.value = {
    tracking_type: animal.tracking_type,
    animal_type_name: animal.animal_type?.name || '',
    breed_name: animal.breed?.name || '',
    name: animal.name || '',
    tag_number: animal.tag_number || '',
    group_name: animal.group_name || '',
    count: animal.count,
    gender: animal.gender || '',
    date_of_birth: animal.date_of_birth || '',
    weight_kg: animal.weight_kg || '',
    purpose: animal.purpose,
    location: animal.location || '',
    notes: animal.notes || ''
  }
  showModal.value = true
}

const submitForm = async () => {
  submitting.value = true

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
    }

    const payload = {
      tracking_type: form.value.tracking_type,
      animal_type_name: form.value.animal_type_name,
      breed_name: form.value.breed_name,
      name: form.value.tracking_type === 'individual' ? form.value.name : null,
      tag_number: form.value.tracking_type === 'individual' ? form.value.tag_number : null,
      group_name: form.value.tracking_type === 'group' ? form.value.group_name : null,
      count: form.value.tracking_type === 'group' ? form.value.count : 1,
      gender: form.value.gender,
      date_of_birth: form.value.date_of_birth || null,
      weight_kg: form.value.weight_kg || null,
      purpose: form.value.purpose,
      location: form.value.location || null,
      notes: form.value.notes || null
    }

    if (isEditing.value && editingUuid.value) {
      if (isOnline.value) {
        const response = await $apiFetch<{ data: Animal }>(`/api/v1/livestock/${editingUuid.value}`, {
          method: 'PUT',
          body: payload
        })
        const index = animals.value.findIndex(a => a.uuid === editingUuid.value)
        if (index !== -1) animals.value[index] = response.data
      } else {
        const index = animals.value.findIndex(a => a.uuid === editingUuid.value)
        if (index !== -1) {
          animals.value[index] = {
            ...animals.value[index],
            ...payload,
            animal_type: { id: 0, name: payload.animal_type_name },
            breed: { id: 0, name: payload.breed_name }
          } as Animal
        }
      }
    } else {
      let newAnimal: Animal
      if (isOnline.value) {
        const response = await $apiFetch<{ data: Animal }>('/api/v1/livestock', {
          method: 'POST',
          body: payload
        })
        newAnimal = response.data
      } else {
        newAnimal = {
          uuid: `temp-${Date.now()}`,
          farm_uuid: '',
          farm: null,
          animal_type: { id: 0, name: payload.animal_type_name },
          breed: { id: 0, name: payload.breed_name },
          tracking_type: payload.tracking_type,
          tag_number: payload.tag_number,
          name: payload.name,
          group_name: payload.group_name,
          count: payload.count,
          gender: payload.gender,
          date_of_birth: payload.date_of_birth,
          weight_kg: payload.weight_kg,
          acquisition_date: new Date().toISOString().split('T')[0],
          acquisition_type: 'purchased',
          purpose: payload.purpose,
          status: 'active',
          health_status: 'healthy',
          location: payload.location,
          notes: payload.notes,
          last_checkup: null
        } as Animal
      }
      animals.value.push(newAnimal)
    }

    closeModal()
  } catch (err: any) {
    console.error('Failed to save animal:', err)
    alert('Failed to save animal: ' + (err.message || 'Unknown error'))
  } finally {
    submitting.value = false
  }
}

const fetchAnimals = async () => {
  loading.value = true
  loadError.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Animal[] }>('/api/v1/livestock')
      animals.value = response.data || response as unknown as Animal[]
    } else {
      animals.value = mockData.animals as Animal[]
    }
  } catch (err: any) {
    console.error('Failed to fetch animals:', err)
    // Fallback to mock data on error
    animals.value = mockData.animals as Animal[]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnimals()
})
</script>
