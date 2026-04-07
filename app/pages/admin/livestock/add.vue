<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        to="/admin/livestock"
        class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        Back to Livestock
      </NuxtLink>
    </div>

    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Add Animal</h1>
      <p class="text-gray-600 mt-1">Record an individual animal or an entire group/flock.</p>
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

    <!-- Tracking Type Selector -->
    <div class="flex items-center gap-2 mb-6">
      <span class="text-sm font-medium text-gray-600 mr-1">Recording:</span>
      <button
        type="button"
        @click="trackingType = 'individual'"
        :class="[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
          trackingType === 'individual'
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
        ]"
      >
        <Tag class="w-3.5 h-3.5" />
        Individual
      </button>
      <button
        type="button"
        @click="trackingType = 'group'"
        :class="[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
          trackingType === 'group'
            ? 'border-purple-500 bg-purple-50 text-purple-700'
            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
        ]"
      >
        <Users class="w-3.5 h-3.5" />
        Group / Flock
      </button>
    </div>

    <!-- ── INDIVIDUAL ANIMAL FORM ── -->
    <form v-if="trackingType === 'individual'" @submit.prevent="submitIndividual" class="space-y-6">

      <!-- Farm & Type -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Farm -->
          <div class="space-y-1">
            <Label for="i_farm_id" class="block text-sm font-semibold text-gray-700">
              Farm <span class="text-red-500">*</span>
            </Label>
            <div v-if="farmsLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading farms...
            </div>
            <select
              v-else
              id="i_farm_uuid"
              v-model="individual.farm_uuid"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              @change="individual.animal_group_uuid = ''"
            >
              <option value="">Select farm</option>
              <option v-for="farm in farms" :key="farm.uuid" :value="farm.uuid">{{ farm.name }}</option>
            </select>
          </div>

          <!-- Animal Group (optional) -->
          <div class="space-y-1">
            <Label for="i_animal_group" class="block text-sm font-semibold text-gray-700">Animal Group</Label>
            <div v-if="groupsLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading groups...
            </div>
            <select
              v-else
              id="i_animal_group"
              v-model="individual.animal_group_uuid"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">None (not part of a group)</option>
              <option v-for="grp in groupsForFarm" :key="grp.uuid" :value="grp.uuid">{{ grp.name }}</option>
            </select>
            <p class="text-xs text-gray-400">Optional — assign this animal to an existing group</p>
          </div>

          <!-- Animal Type -->
          <div class="space-y-1">
            <Label for="i_animal_type_id" class="block text-sm font-semibold text-gray-700">
              Animal Type <span class="text-red-500">*</span>
            </Label>
            <div v-if="typesLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading types...
            </div>
            <select
              v-else
              id="i_animal_type_id"
              v-model="individual.animal_type_id"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              @change="individual.animal_breed_id = ''"
            >
              <option value="">Select animal type</option>
              <option v-for="type in animalTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <!-- Breed -->
          <div class="space-y-1">
            <Label for="i_breed_id" class="block text-sm font-semibold text-gray-700">Breed</Label>
            <select
              id="i_breed_id"
              v-model="individual.animal_breed_id"
              :disabled="!individual.animal_type_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{{ individual.animal_type_id ? 'Select breed (optional)' : 'Select type first' }}</option>
              <option v-for="breed in breedsForIndividual" :key="breed.id" :value="breed.id">{{ breed.name }}</option>
            </select>
          </div>

          <!-- Tag Number -->
          <div class="space-y-1">
            <Label for="i_tag" class="block text-sm font-semibold text-gray-700">Tag Number</Label>
            <Input
              id="i_tag"
              v-model="individual.tag_number"
              type="text"
              placeholder="e.g. GV-C001"
              class="w-full"
            />
          </div>

          <!-- Name -->
          <div class="space-y-1">
            <Label for="i_name" class="block text-sm font-semibold text-gray-700">Animal Name</Label>
            <Input
              id="i_name"
              v-model="individual.name"
              type="text"
              placeholder="e.g. Bessie"
              class="w-full"
            />
          </div>

          <!-- Gender -->
          <div class="space-y-1">
            <Label for="i_gender" class="block text-sm font-semibold text-gray-700">Gender</Label>
            <select
              id="i_gender"
              v-model="individual.gender"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <!-- Date of Birth -->
          <div class="space-y-1">
            <Label for="i_dob" class="block text-sm font-semibold text-gray-700">Date of Birth</Label>
            <Input id="i_dob" v-model="individual.date_of_birth" type="date" class="w-full" />
          </div>
        </div>
      </div>

      <!-- Acquisition -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Acquisition Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Acquisition Date -->
          <div class="space-y-1">
            <Label for="i_acq_date" class="block text-sm font-semibold text-gray-700">Acquisition Date</Label>
            <Input id="i_acq_date" v-model="individual.acquisition_date" type="date" class="w-full" />
          </div>

          <!-- Acquisition Type -->
          <div class="space-y-1">
            <Label for="i_acq_type" class="block text-sm font-semibold text-gray-700">How was it acquired?</Label>
            <select
              id="i_acq_type"
              v-model="individual.acquisition_type"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="born">Born on farm</option>
              <option value="purchased">Purchased</option>
              <option value="donated">Donated</option>
              <option value="transferred">Transferred in</option>
            </select>
          </div>

          <!-- Purchase Price (only if purchased) -->
          <div v-if="individual.acquisition_type === 'purchased'" class="space-y-1">
            <Label for="i_price" class="block text-sm font-semibold text-gray-700">Purchase Price</Label>
            <Input
              id="i_price"
              v-model="individual.purchase_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
        <textarea
          v-model="individual.notes"
          rows="3"
          placeholder="Any additional notes about this animal..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pb-8">
        <NuxtLink
          to="/admin/livestock"
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
            <Tag class="w-4 h-4 mr-2" />
            Save Animal
          </span>
        </Button>
      </div>
    </form>

    <!-- ── GROUP FORM ── -->
    <form v-else-if="trackingType === 'group'" @submit.prevent="submitGroup" class="space-y-6">

      <!-- Farm, Field & Type -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Group Information</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Farm -->
          <div class="space-y-1">
            <Label for="g_farm_id" class="block text-sm font-semibold text-gray-700">
              Farm <span class="text-red-500">*</span>
            </Label>
            <div v-if="farmsLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading farms...
            </div>
            <select
              v-else
              id="g_farm_uuid"
              v-model="group.farm_uuid"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              @change="onGroupFarmChange"
            >
              <option value="">Select farm</option>
              <option v-for="farm in farms" :key="farm.uuid" :value="farm.uuid">{{ farm.name }}</option>
            </select>
          </div>

          <!-- Field (optional, loaded after farm selected) -->
          <div class="space-y-1">
            <Label for="g_field_id" class="block text-sm font-semibold text-gray-700">Field / Paddock</Label>
            <div v-if="fieldsLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading fields...
            </div>
            <select
              v-else
              id="g_field_id"
              v-model="group.field_id"
              :disabled="!group.farm_uuid"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{{ group.farm_uuid ? 'None (free range)' : 'Select farm first' }}</option>
              <option v-for="field in fields" :key="field.id" :value="field.id">{{ field.name }}</option>
            </select>
            <p class="text-xs text-gray-400">Optional — the paddock or pen where this group lives</p>
          </div>

          <!-- Animal Type -->
          <div class="space-y-1">
            <Label for="g_animal_type_id" class="block text-sm font-semibold text-gray-700">
              Animal Type <span class="text-red-500">*</span>
            </Label>
            <div v-if="typesLoading" class="flex items-center gap-2 py-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Loading types...
            </div>
            <select
              v-else
              id="g_animal_type_id"
              v-model="group.animal_type_id"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              @change="group.animal_breed_id = ''"
            >
              <option value="">Select animal type</option>
              <option v-for="type in animalTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <!-- Breed -->
          <div class="space-y-1">
            <Label for="g_breed_id" class="block text-sm font-semibold text-gray-700">Breed</Label>
            <select
              id="g_breed_id"
              v-model="group.animal_breed_id"
              :disabled="!group.animal_type_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{{ group.animal_type_id ? 'Select breed (optional)' : 'Select type first' }}</option>
              <option v-for="breed in breedsForGroup" :key="breed.id" :value="breed.id">{{ breed.name }}</option>
            </select>
          </div>

          <!-- Group Name -->
          <div class="space-y-1">
            <Label for="g_name" class="block text-sm font-semibold text-gray-700">
              Group Name <span class="text-red-500">*</span>
            </Label>
            <Input
              id="g_name"
              v-model="group.name"
              type="text"
              placeholder="e.g. Merino Flock A, Layer House 1"
              required
              class="w-full"
            />
          </div>

          <!-- Initial Count -->
          <div class="space-y-1">
            <Label for="g_count" class="block text-sm font-semibold text-gray-700">
              Number of Animals <span class="text-red-500">*</span>
            </Label>
            <Input
              id="g_count"
              v-model="group.initial_count"
              type="number"
              min="1"
              placeholder="e.g. 50"
              required
              class="w-full"
            />
            <p class="text-xs text-gray-400">Current count starts at this number. You can update it later.</p>
          </div>

          <!-- Purpose -->
          <div class="space-y-1">
            <Label for="g_purpose" class="block text-sm font-semibold text-gray-700">
              Purpose <span class="text-red-500">*</span>
            </Label>
            <select
              id="g_purpose"
              v-model="group.purpose"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="commercial">Commercial (for sale/profit)</option>
              <option value="subsistence">Subsistence (own use)</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

        </div>
      </div>

      <!-- Acquisition -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Acquisition Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Acquired Date -->
          <div class="space-y-1">
            <Label for="g_acq_date" class="block text-sm font-semibold text-gray-700">
              Date Acquired <span class="text-red-500">*</span>
            </Label>
            <Input id="g_acq_date" v-model="group.acquired_date" type="date" required class="w-full" />
          </div>

          <!-- Acquisition Type -->
          <div class="space-y-1">
            <Label for="g_acq_type" class="block text-sm font-semibold text-gray-700">How was the group acquired?</Label>
            <select
              id="g_acq_type"
              v-model="group.acquisition_type"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="purchased">Purchased</option>
              <option value="born">Born on farm</option>
              <option value="donated">Donated</option>
              <option value="transferred">Transferred in</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Description</h2>
        <textarea
          v-model="group.description"
          rows="3"
          placeholder="Any notes about this group — breed mix, health history, feeding regime, etc."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pb-8">
        <NuxtLink
          to="/admin/livestock"
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
            <Users class="w-4 h-4 mr-2" />
            Save Group
          </span>
        </Button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ChevronLeft, Tag, Users, CheckCircle, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

interface Farm {
  id: number
  uuid: string
  name: string
}

interface AnimalGroup {
  uuid: string
  name: string
  farm_uuid?: string
}

interface Field {
  id: number
  uuid?: string
  name: string
}

interface AnimalType {
  id: number
  name: string
}

interface AnimalBreed {
  id: number
  animal_type_id: number
  name: string
}

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const router = useRouter()

const trackingType = ref<'individual' | 'group'>('individual')
const submitting = ref(false)
const successMessage = ref<string | null>(null)
const generalError = ref<string | null>(null)

// Dropdown data
const farms = ref<Farm[]>([])
const fields = ref<Field[]>([])
const animalTypes = ref<AnimalType[]>([])
const breeds = ref<AnimalBreed[]>([])
const animalGroups = ref<AnimalGroup[]>([])

const farmsLoading = ref(true)
const fieldsLoading = ref(false)
const typesLoading = ref(true)
const groupsLoading = ref(false)

// Individual animal form
const individual = ref({
  farm_uuid: '',
  animal_group_uuid: '',
  animal_type_id: '' as number | '',
  animal_breed_id: '' as number | '',
  tag_number: '',
  name: '',
  gender: 'unknown' as 'male' | 'female' | 'unknown',
  date_of_birth: '',
  acquisition_date: new Date().toISOString().split('T')[0],
  acquisition_type: 'born' as 'born' | 'purchased' | 'donated' | 'transferred',
  purchase_price: '',
  notes: ''
})

// Group form
const group = ref({
  farm_uuid: '',
  field_id: '' as number | '',
  animal_type_id: '' as number | '',
  animal_breed_id: '' as number | '',
  name: '',
  initial_count: '',
  acquired_date: new Date().toISOString().split('T')[0],
  acquisition_type: 'purchased' as 'born' | 'purchased' | 'donated' | 'transferred',
  purpose: 'commercial' as 'commercial' | 'subsistence' | 'mixed',
  description: ''
})

const breedsForIndividual = computed(() =>
  individual.value.animal_type_id
    ? breeds.value.filter(b => b.animal_type_id === Number(individual.value.animal_type_id))
    : []
)

const groupsForFarm = computed(() => animalGroups.value)

const breedsForGroup = computed(() =>
  group.value.animal_type_id
    ? breeds.value.filter(b => b.animal_type_id === Number(group.value.animal_type_id))
    : []
)

const onGroupFarmChange = async () => {
  group.value.field_id = ''
  fields.value = []
  if (!group.value.farm_uuid || !isOnline.value) return
  fieldsLoading.value = true
  try {
    const response = await $apiFetch<{ data: Field[] }>(`/api/v1/farms/fields/list/${group.value.farm_uuid}`)
    fields.value = response.data ?? (response as unknown as Field[])
  } catch (err) {
    console.error('Failed to load fields:', err)
  } finally {
    fieldsLoading.value = false
  }
}

const submitIndividual = async () => {
  generalError.value = null
  successMessage.value = null
  submitting.value = true
  try {
    if (isOnline.value) await $apiFetch('/sanctum/csrf-cookie')

    const payload = {
      farm_uuid: individual.value.farm_uuid || null,
      animal_group_uuid: individual.value.animal_group_uuid || null,
      animal_type_id: individual.value.animal_type_id || null,
      animal_breed_id: individual.value.animal_breed_id || null,
      tag_number: individual.value.tag_number || null,
      name: individual.value.name || null,
      gender: individual.value.gender,
      date_of_birth: individual.value.date_of_birth || null,
      acquisition_date: individual.value.acquisition_date || null,
      acquisition_type: individual.value.acquisition_type,
      purchase_price: individual.value.purchase_price ? Number(individual.value.purchase_price) : null,
      notes: individual.value.notes || null
    }

    if (isOnline.value) {
      await $apiFetch('/api/v1/farms/farm/animals', { method: 'POST', body: payload })
    }

    successMessage.value = 'Animal saved successfully!'
    await router.push('/admin/livestock')
  } catch (err: any) {
    console.error('Failed to save animal:', err)
    generalError.value = 'Failed to save animal: ' + (err.message || 'Unknown error')
  } finally {
    submitting.value = false
  }
}

const submitGroup = async () => {
  generalError.value = null
  successMessage.value = null
  submitting.value = true
  try {
    if (isOnline.value) await $apiFetch('/sanctum/csrf-cookie')

    const payload = {
      farm_uuid: group.value.farm_uuid || null,
      field_id: group.value.field_id || null,
      animal_type_id: group.value.animal_type_id || null,
      animal_breed_id: group.value.animal_breed_id || null,
      name: group.value.name,
      initial_count: Number(group.value.initial_count),
      acquired_date: group.value.acquired_date,
      acquisition_type: group.value.acquisition_type,
      purpose: group.value.purpose,
      description: group.value.description || null
    }

    if (isOnline.value) {
      await $apiFetch('/api/v1/farms/farm/animals/groups', { method: 'POST', body: payload })
    }

    successMessage.value = 'Group saved successfully!'
    await router.push('/admin/livestock')
  } catch (err: any) {
    console.error('Failed to save group:', err)
    generalError.value = 'Failed to save group: ' + (err.message || 'Unknown error')
  } finally {
    submitting.value = false
  }
}

const fetchFarms = async () => {
  farmsLoading.value = true
  try {
    if (isOnline.value) {
      const response = await $apiFetch<{ data: Farm[] }>('/api/v1/farms')
      farms.value = response.data ?? (response as unknown as Farm[])
    }
  } catch (err) {
    console.error('Failed to load farms:', err)
  } finally {
    farmsLoading.value = false
  }
}

const fetchAnimalTypes = async () => {
  typesLoading.value = true
  try {
    if (isOnline.value) {
      const response = await $apiFetch<{ data: AnimalType[] }>('/api/v1/settings/animals/animal-types/list')
      animalTypes.value = response.data ?? (response as unknown as AnimalType[])
    }
  } catch (err) {
    console.error('Failed to load animal types:', err)
  } finally {
    typesLoading.value = false
  }
}

const fetchBreeds = async () => {
  try {
    if (isOnline.value) {
      const response = await $apiFetch<{ data: AnimalBreed[] }>('/api/v1/settings/animals/animal-breeds/list')
      breeds.value = response.data ?? (response as unknown as AnimalBreed[])
    }
  } catch (err) {
    console.error('Failed to load breeds:', err)
  }
}

const fetchAnimalGroups = async () => {
  groupsLoading.value = true
  try {
    if (isOnline.value) {
      const response = await $apiFetch<{ data: AnimalGroup[] }>('/api/v1/farms/farm/animals/groups/list')
      animalGroups.value = response.data ?? (response as unknown as AnimalGroup[])
    }
  } catch (err) {
    console.error('Failed to load animal groups:', err)
  } finally {
    groupsLoading.value = false
  }
}

onMounted(() => {
  fetchFarms()
  fetchAnimalTypes()
  fetchBreeds()
  fetchAnimalGroups()
})
</script>
