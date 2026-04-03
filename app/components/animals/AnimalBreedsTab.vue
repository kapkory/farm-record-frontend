<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading breeds...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Failed to load breeds</p>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="fetchData" class="mt-2 text-sm underline hover:no-underline">Try again</button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Animal Breeds</h3>
        <Button @click="openAddModal">
          <Plus class="w-4 h-4 mr-2" />
          Add Breed
        </Button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Lifespan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gestation Period</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in breeds" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.animal_type?.name || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.average_lifespan_months }} months</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.gestation_days }} days</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                  {{ item.purpose }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editItem(item)" class="text-green-600 hover:text-green-900 mr-3">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="deleteItem(item.uuid)" class="text-red-600 hover:text-red-900">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="breeds.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No breeds found. Add your first breed to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
        
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? 'Edit Breed' : 'Add Breed' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="submitForm" class="p-4 space-y-4">
              <div>
                <Label for="animal_type_id" class="block text-sm font-medium text-gray-700 mb-1">Animal Type *</Label>
                <select
                  id="animal_type_id"
                  v-model="form.animal_type_id"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select animal type</option>
                  <option v-for="type in animalTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                </select>
              </div>

              <div>
                <Label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Enter breed name"
                  required
                  class="w-full"
                />
              </div>

              <div>
                <Label for="average_lifespan_months" class="block text-sm font-medium text-gray-700 mb-1">Average Lifespan (months)</Label>
                <Input
                  id="average_lifespan_months"
                  v-model="form.average_lifespan_months"
                  type="number"
                  placeholder="Enter average lifespan"
                  min="1"
                  max="600"
                  class="w-full"
                />
              </div>

              <div>
                <Label for="gestation_days" class="block text-sm font-medium text-gray-700 mb-1">Gestation Period (days)</Label>
                <Input
                  id="gestation_days"
                  v-model="form.gestation_days"
                  type="number"
                  placeholder="Enter gestation period in days"
                  min="0"
                  class="w-full"
                />
              </div>

              <div>
                <Label for="purpose" class="block text-sm font-medium text-gray-700 mb-1">Purpose *</Label>
                <select
                  id="purpose"
                  v-model="form.purpose"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select purpose</option>
                  <option v-for="purpose in animalPurposes" :key="purpose" :value="purpose">{{ purpose }}</option>
                </select>
              </div>

              <div>
                <Label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  placeholder="Enter description"
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
                  <span v-else>{{ isEditing ? 'Update' : 'Add' }} Breed</span>
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
import { Plus, Pencil, Trash2, X } from 'lucide-vue-next'
// import mockData from '~/data/animals.json'

interface AnimalTypeRef {
  id: number
  name: string
}

interface AnimalBreed {
  id: number
  uuid?: string
  animal_type_id: number
  animal_type?: AnimalTypeRef
  name: string
  description: string | null
  average_lifespan_months: number | null
  gestation_days: number | null
  purpose: string
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()

const animalPurposes = ['meat', 'dairy', 'eggs', 'honey', 'wool', 'breeding', 'dual', 'other'];
const breeds = ref<AnimalBreed[]>([])
const animalTypes = ref<AnimalTypeRef[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingUuid = ref<string | null>(null)

const form = ref({
  animal_type_id: '' as number | '',
  name: '',
  average_lifespan_months: '',
  gestation_days: '',
  purpose: '',
  description: ''
})

const resetForm = () => {
  form.value = {
    animal_type_id: '',
    name: '',
    average_lifespan_months: '',
    gestation_days: '',
    purpose: '',
    description: ''
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

const submitForm = async () => {
  submitting.value = true

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
    }

    const payload = {
      animal_type_id: form.value.animal_type_id,
      name: form.value.name,
      average_lifespan_months: form.value.average_lifespan_months ? Number(form.value.average_lifespan_months) : null,
      gestation_days: form.value.gestation_days ? Number(form.value.gestation_days) : null,
      purpose: form.value.purpose,
      description: form.value.description || null
    }

    if (isEditing.value && editingUuid.value) {
      if (isOnline.value) {
        const response = await $apiFetch<{ status: string; message: string; data: AnimalBreed }>(`/api/v1/settings/animals/animal-breeds/${editingUuid.value}`, {
          method: 'PUT',
          body: payload
        })
        const index = breeds.value.findIndex(b => b.uuid === editingUuid.value)
        if (index !== -1) {
          breeds.value[index] = response.data
        }
      } else {
        const index = breeds.value.findIndex(b => b.uuid === editingUuid.value)
        if (index !== -1) {
          breeds.value[index] = { ...breeds.value[index], ...payload } as AnimalBreed
        }
      }
    } else {
      let newItem: AnimalBreed
      if (isOnline.value) {
        const response = await $apiFetch<{ status: string; message: string; data: AnimalBreed }>('/api/v1/settings/animals/animal-breeds', {
          method: 'POST',
          body: payload
        })
        newItem = response.data
      } else {
        newItem = { id: Date.now(), ...payload } as AnimalBreed
      }
      breeds.value.push(newItem)
    }

    closeModal()
  } catch (err: any) {
    console.error('Failed to save breed:', err)
    alert('Failed to save breed: ' + (err.message || 'Unknown error'))
  } finally {
    submitting.value = false
  }
}

const fetchAnimalTypes = async () => {
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: AnimalTypeRef[] }>('/api/v1/settings/animals/animal-types/list')
      animalTypes.value = response.data || response as unknown as AnimalTypeRef[]
    } else {
      // animalTypes.value = mockData.animalTypes.map(t => ({ id: t.id, name: t.name }))
    }
  } catch (err: any) {
    console.error('Failed to fetch animal types:', err)
    // animalTypes.value = mockData.animalTypes.map(t => ({ id: t.id, name: t.name }))
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: AnimalBreed[] }>('/api/v1/settings/animals/animal-breeds/list')
      breeds.value = response.data || response as unknown as AnimalBreed[]
    } else {
      // breeds.value = mockData.animalBreeds as AnimalBreed[]
    }
  } catch (err: any) {
    console.error('Failed to fetch breeds:', err)
    // breeds.value = mockData.animalBreeds as AnimalBreed[]
  } finally {
    loading.value = false
  }
}

const editItem = (item: AnimalBreed) => {
  isEditing.value = true
  editingUuid.value = item.uuid ?? null
  form.value = {
    animal_type_id: item.animal_type_id,
    name: item.name,
    average_lifespan_months: item.average_lifespan_months?.toString() ?? '',
    gestation_days: item.gestation_days?.toString() ?? '',
    purpose: item.purpose,
    description: item.description || ''
  }
  showModal.value = true
}

const deleteItem = async (uuid?: string) => {
  if (!uuid || !confirm('Are you sure you want to delete this breed?')) return

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      await $apiFetch(`/api/v1/settings/animals/animal-breeds/${uuid}`, { method: 'DELETE' })
    }
    breeds.value = breeds.value.filter(item => item.uuid !== uuid)
  } catch (err: any) {
    console.error('Failed to delete:', err)
    alert('Failed to delete breed')
  }
}

onMounted(() => {
  fetchAnimalTypes()
  fetchData()
})
</script>
