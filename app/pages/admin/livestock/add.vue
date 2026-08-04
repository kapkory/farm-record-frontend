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
      <h1 class="text-3xl font-bold text-gray-900">{{ isEditing ? 'Edit Animal' : 'Add Animal' }}</h1>
      <p class="text-gray-600 mt-1">
        {{ isEditing
          ? 'Update this animal\u2019s details. Fields you leave alone keep their current value.'
          : 'Record an individual animal or an entire group/flock.' }}
      </p>
    </div>

    <!-- Fetching the record being edited -->
    <div v-if="loadingRecord" class="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div class="h-5 w-5 animate-spin rounded-full border-b-2 border-green-500"></div>
      <p class="text-sm text-gray-600">Loading animal\u2026</p>
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
    <div v-if="!isEditing" class="flex items-center gap-2 mb-6">
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
            <select
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
            <select
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
            <select
              id="i_animal_type_id"
              v-model="individual.animal_type_id"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              @change="onIndividualTypeChange"
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

          <!-- Vaccination / treatment plan (set when the animal is created;
               re-applying one on edit would regenerate its whole schedule) -->
          <div v-if="!isEditing" class="space-y-1">
            <Label for="i_treatment_plan" class="block text-sm font-semibold text-gray-700">Vaccination Plan</Label>
            <select
              id="i_treatment_plan"
              v-model="individual.treatment_plan_uuid"
              :disabled="!individual.animal_type_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{{ individual.animal_type_id ? 'None' : 'Select type first' }}</option>
              <option v-for="plan in plansForIndividual" :key="plan.uuid" :value="plan.uuid">
                {{ plan.name }}{{ plan.is_system ? ' (recommended)' : '' }}
              </option>
            </select>
            <p v-if="selectedIndividualPlan?.activities?.length" class="text-xs text-green-700">
              {{ selectedIndividualPlan.activities.length }} reminder(s) will be added, counted from date of birth
            </p>
            <p v-else class="text-xs text-gray-400">Optional — reminders are added to your calendar automatically</p>
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

          <!-- Mother (dam) -->
          <div v-if="!isEditing" class="space-y-1">
            <Label for="i_dam" class="block text-sm font-semibold text-gray-700">Mother <span class="font-normal text-gray-400">(optional)</span></Label>
            <select
              id="i_dam"
              v-model="individual.dam_uuid"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Not recorded</option>
              <option v-for="a in damChoices" :key="a.uuid" :value="a.uuid">{{ animalLabel(a) }}</option>
            </select>
          </div>

          <!-- Father (sire) -->
          <div v-if="!isEditing" class="space-y-1">
            <Label for="i_sire" class="block text-sm font-semibold text-gray-700">Father <span class="font-normal text-gray-400">(optional)</span></Label>
            <select
              id="i_sire"
              v-model="individual.sire_uuid"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Not recorded</option>
              <option v-for="a in sireChoices" :key="a.uuid" :value="a.uuid">{{ animalLabel(a) }}</option>
            </select>
            <p class="text-xs text-gray-400">Recording parents lets the app warn about inbreeding risk when you breed this animal.</p>
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

      <!-- Status (edit only — a new animal is always active) -->
      <div v-if="isEditing" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Status</h2>
        <div class="space-y-1 md:w-1/2">
          <Label for="i_status" class="block text-sm font-semibold text-gray-700">Current Status</Label>
          <select
            id="i_status"
            v-model="individual.status"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="deceased">Deceased</option>
            <option value="transferred">Transferred</option>
          </select>
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
            {{ isEditing ? 'Save Changes' : 'Save Animal' }}
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
            <select
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
            <select
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
            <select
              id="g_animal_type_id"
              v-model="group.animal_type_id"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              @change="onGroupTypeChange"
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

          <!-- Vaccination / treatment plan -->
          <div class="space-y-1">
            <Label for="g_treatment_plan" class="block text-sm font-semibold text-gray-700">Vaccination Plan</Label>
            <select
              id="g_treatment_plan"
              v-model="group.treatment_plan_uuid"
              :disabled="!group.animal_type_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{{ group.animal_type_id ? 'None' : 'Select type first' }}</option>
              <option v-for="plan in plansForGroup" :key="plan.uuid" :value="plan.uuid">
                {{ plan.name }}{{ plan.is_system ? ' (recommended)' : '' }}
              </option>
            </select>
            <p class="text-xs text-gray-400">Optional — vaccination reminders are added to your calendar automatically</p>
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

        <!-- Preview of the reminders the selected plan will create -->
        <div v-if="selectedGroupPlan?.activities?.length" class="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p class="text-sm font-semibold text-green-800 mb-2">
            {{ selectedGroupPlan.activities.length }} vaccination reminder(s) will be added to your calendar, counted from the date acquired:
          </p>
          <ul class="space-y-1">
            <li v-for="activity in selectedGroupPlan.activities" :key="activity.uuid" class="text-sm text-green-900 flex gap-2">
              <span class="font-medium w-20 shrink-0">{{ activity.age_label }}</span>
              <span>{{ activity.vaccine }}<template v-if="activity.disease"> — {{ activity.disease }}</template></span>
            </li>
          </ul>
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

interface TreatmentPlanActivity {
  uuid: string
  vaccine: string
  disease?: string | null
  route?: string | null
  age_days: number
  age_label: string
}

interface TreatmentPlan {
  uuid: string
  name: string
  animal_type?: string | null
  is_system: boolean
  activities: TreatmentPlanActivity[]
}

const { isOnline } = useOffline()
const { getReference } = useReferenceData()
const animalResource = useOfflineEntity<Record<string, any>>('animal')
const groupResource = useOfflineEntity<Record<string, any>>('animalGroup')
const router = useRouter()
const route = useRoute()

// This page doubles as the edit screen: /admin/livestock/add?edit=<uuid>.
// Reusing the form means there is only one place where an animal's fields are
// defined, rather than a second screen that drifts out of step with this one.
const editUuid = computed(() => String(route.query.edit ?? ''))
const isEditing = computed(() => editUuid.value.length > 0)
const loadingRecord = ref(false)

const trackingType = ref<'individual' | 'group'>('individual')
const submitting = ref(false)
const successMessage = ref<string | null>(null)
const generalError = ref<string | null>(null)

// Dropdown data. No loading flags on purpose: selects render immediately
// and fill in when the (usually cached) reference data lands — a spinner
// here only blocks the page.
const farms = ref<Farm[]>([])
const fields = ref<Field[]>([])
const animalTypes = ref<AnimalType[]>([])
const breeds = ref<AnimalBreed[]>([])
const animalGroups = ref<AnimalGroup[]>([])
const treatmentPlans = ref<TreatmentPlan[]>([])

// Individual animal form
const individual = ref({
  farm_uuid: '',
  animal_group_uuid: '',
  animal_type_id: '' as number | '',
  animal_breed_id: '' as number | '',
  treatment_plan_uuid: '',
  tag_number: '',
  name: '',
  gender: 'unknown' as 'male' | 'female' | 'unknown',
  date_of_birth: '',
  dam_uuid: '',
  sire_uuid: '',
  acquisition_date: new Date().toISOString().split('T')[0],
  acquisition_type: 'born' as 'born' | 'purchased' | 'donated' | 'transferred',
  purchase_price: '',
  status: 'active' as 'active' | 'sold' | 'deceased' | 'transferred',
  notes: ''
})

// Group form
const group = ref({
  farm_uuid: '',
  field_id: '' as number | '',
  animal_type_id: '' as number | '',
  animal_breed_id: '' as number | '',
  treatment_plan_uuid: '',
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

// Plans matching a chosen animal type (untyped plans always show).
const plansForType = (animalTypeId: number | '') => {
  const typeName = animalTypes.value
    .find(t => t.id === Number(animalTypeId))?.name?.toLowerCase()
  if (!typeName) return []
  return treatmentPlans.value.filter(p =>
    !p.animal_type || p.animal_type.toLowerCase() === typeName)
}

const plansForGroup = computed(() => plansForType(group.value.animal_type_id))
const plansForIndividual = computed(() => plansForType(individual.value.animal_type_id))

const selectedGroupPlan = computed(() =>
  treatmentPlans.value.find(p => p.uuid === group.value.treatment_plan_uuid) ?? null)
const selectedIndividualPlan = computed(() =>
  treatmentPlans.value.find(p => p.uuid === individual.value.treatment_plan_uuid) ?? null)

const onGroupTypeChange = () => {
  group.value.animal_breed_id = ''
  group.value.treatment_plan_uuid = ''
  // Pre-select the recommended (system) plan for this type — one less tap.
  const recommended = plansForGroup.value.find(p => p.is_system)
  if (recommended) group.value.treatment_plan_uuid = recommended.uuid
}

const onIndividualTypeChange = () => {
  individual.value.animal_breed_id = ''
  individual.value.treatment_plan_uuid = ''
  const recommended = plansForIndividual.value.find(p => p.is_system)
  if (recommended) individual.value.treatment_plan_uuid = recommended.uuid
}

const onGroupFarmChange = async () => {
  group.value.field_id = ''
  fields.value = []
  if (!group.value.farm_uuid) return
  try {
    const { data } = await getReference<Field>(`fields_${group.value.farm_uuid}`, {
      url: `/api/v1/farms/fields/list/${group.value.farm_uuid}`
    })
    fields.value = data
  } catch (err) {
    console.error('Failed to load fields:', err)
  }
}

const submitIndividual = async () => {
  generalError.value = null
  successMessage.value = null
  submitting.value = true
  try {
    const payload = {
      farm_uuid: individual.value.farm_uuid || null,
      animal_group_uuid: individual.value.animal_group_uuid || null,
      animal_type_id: individual.value.animal_type_id || null,
      animal_breed_id: individual.value.animal_breed_id || null,
      treatment_plan_uuid: individual.value.treatment_plan_uuid || null,
      tag_number: individual.value.tag_number || null,
      name: individual.value.name || null,
      gender: individual.value.gender,
      date_of_birth: individual.value.date_of_birth || null,
      dam_uuid: individual.value.dam_uuid || null,
      sire_uuid: individual.value.sire_uuid || null,
      acquisition_date: individual.value.acquisition_date || null,
      acquisition_type: individual.value.acquisition_type,
      purchase_price: individual.value.purchase_price ? Number(individual.value.purchase_price) : null,
      notes: individual.value.notes || null
    }

    if (isEditing.value) {
      // Only the fields this form actually shows and pre-filled. The backend
      // update is patch-style, so anything omitted here — vaccination plan,
      // parents — keeps its stored value instead of being blanked.
      const patch = {
        farm_uuid: payload.farm_uuid,
        animal_group_uuid: payload.animal_group_uuid,
        animal_type_id: payload.animal_type_id,
        animal_breed_id: payload.animal_breed_id,
        tag_number: payload.tag_number,
        name: payload.name,
        gender: payload.gender,
        date_of_birth: payload.date_of_birth,
        acquisition_date: payload.acquisition_date,
        acquisition_type: payload.acquisition_type,
        purchase_price: payload.purchase_price,
        status: individual.value.status,
        notes: payload.notes
      }

      const updated = await animalResource.update(editUuid.value, patch)
      if (!updated.ok) {
        generalError.value = updated.message || 'Failed to update animal'
        return
      }

      successMessage.value = updated.synced
        ? 'Animal updated successfully!'
        : 'Changes saved locally — they will sync when you are back online.'
      await router.push(`/admin/livestock/animal/${editUuid.value}`)
      return
    }

    const result = await animalResource.create(payload, {
      ...payload,
      tracking_type: 'individual',
      status: 'active',
      count: 1,
      animal_type: animalTypes.value.find(t => t.id === Number(individual.value.animal_type_id)) ?? null,
      breed: breeds.value.find(b => b.id === Number(individual.value.animal_breed_id)) ?? null,
      // The list reads farm off a nested object; without it a freshly created
      // animal shows a blank Farm cell until the next full fetch.
      farm: farms.value.find(f => f.uuid === individual.value.farm_uuid) ?? null
    })
    if (!result.ok) {
      generalError.value = result.message || 'Failed to save animal'
      return
    }

    successMessage.value = result.synced
      ? 'Animal saved successfully!'
      : 'Animal saved locally — it will sync when you are back online.'
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
    const payload = {
      farm_uuid: group.value.farm_uuid || null,
      field_id: group.value.field_id || null,
      animal_type_id: group.value.animal_type_id || null,
      animal_breed_id: group.value.animal_breed_id || null,
      treatment_plan_uuid: group.value.treatment_plan_uuid || null,
      name: group.value.name,
      initial_count: Number(group.value.initial_count),
      acquired_date: group.value.acquired_date,
      acquisition_type: group.value.acquisition_type,
      purpose: group.value.purpose,
      description: group.value.description || null
    }

    const result = await groupResource.create(payload, {
      ...payload,
      tracking_type: 'group',
      status: 'active',
      count: Number(group.value.initial_count),
      current_count: Number(group.value.initial_count),
      animal_type: animalTypes.value.find(t => t.id === Number(group.value.animal_type_id)) ?? null,
      breed: breeds.value.find(b => b.id === Number(group.value.animal_breed_id)) ?? null,
      farm: farms.value.find(f => f.uuid === group.value.farm_uuid) ?? null,
      group_name: group.value.name,
      treatment_plan: selectedGroupPlan.value?.name ?? null
    })
    if (!result.ok) {
      generalError.value = result.message || 'Failed to save group'
      return
    }

    successMessage.value = result.synced
      ? 'Group saved successfully!'
      : 'Group saved locally — it will sync when you are back online.'
    await router.push('/admin/livestock')
  } catch (err: any) {
    console.error('Failed to save group:', err)
    generalError.value = 'Failed to save group: ' + (err.message || 'Unknown error')
  } finally {
    submitting.value = false
  }
}

const fetchFarms = async () => {
  try {
    const { data } = await getReference<Farm>('farms_list')
    farms.value = data
  } catch (err) {
    console.error('Failed to load farms:', err)
  }
}

const fetchAnimalTypes = async () => {
  try {
    const { data } = await getReference<AnimalType>('animal_types')
    animalTypes.value = data
  } catch (err) {
    console.error('Failed to load animal types:', err)
  }
}

const fetchBreeds = async () => {
  try {
    const { data } = await getReference<AnimalBreed>('animal_breeds')
    breeds.value = data
  } catch (err) {
    console.error('Failed to load breeds:', err)
  }
}

const fetchAnimalGroups = async () => {
  try {
    const { data } = await getReference<AnimalGroup>('animal_groups')
    animalGroups.value = data
  } catch (err) {
    console.error('Failed to load animal groups:', err)
  }
}

const fetchTreatmentPlans = async () => {
  try {
    const { data } = await getReference<TreatmentPlan>('treatment_plans')
    treatmentPlans.value = data
  } catch (err) {
    console.error('Failed to load treatment plans:', err)
  }
}

// Existing individual animals, for optional parent (mother/father) pickers.
const existingAnimals = ref<Array<{ uuid: string; name: string | null; tag_number: string | null; gender: string; tracking_type: string }>>([])
const fetchExistingAnimals = async () => {
  try {
    const { data } = await getReference<any>('livestock_list')
    existingAnimals.value = (data ?? []).filter((a: any) => a.tracking_type === 'individual')
  } catch (err) {
    console.error('Failed to load animals for parent selection:', err)
  }
}

const damChoices = computed(() => existingAnimals.value.filter(a => a.gender === 'female'))
const sireChoices = computed(() => existingAnimals.value.filter(a => a.gender === 'male'))
const animalLabel = (a: { name: string | null; tag_number: string | null }) =>
  a.name || a.tag_number || 'Unnamed animal'

/**
 * Pull the animal being edited into the form. Reads through the offline
 * resource, so an animal created offline and not yet synced is still editable.
 */
const loadAnimalForEdit = async () => {
  if (!isEditing.value) return

  loadingRecord.value = true
  try {
    const record: any = await animalResource.find(editUuid.value)

    if (!record) {
      generalError.value = 'That animal could not be found.'
      return
    }

    if (record.tracking_type === 'group') {
      generalError.value = 'Groups cannot be edited from this screen yet. Open the group to manage it.'
      return
    }

    trackingType.value = 'individual'
    individual.value = {
      farm_uuid: record.farm_uuid ?? record.farm?.uuid ?? '',
      animal_group_uuid: record.animal_group?.uuid ?? '',
      animal_type_id: record.animal_type?.id ?? '',
      animal_breed_id: record.breed?.id ?? '',
      // Set at creation and deliberately not re-editable here.
      treatment_plan_uuid: '',
      tag_number: record.tag_number ?? '',
      name: record.name ?? '',
      gender: record.gender ?? 'unknown',
      date_of_birth: record.date_of_birth ?? '',
      dam_uuid: '',
      sire_uuid: '',
      acquisition_date: record.acquisition_date ?? '',
      acquisition_type: record.acquisition_type ?? 'born',
      purchase_price: record.purchase_price !== null && record.purchase_price !== undefined
        ? String(record.purchase_price)
        : '',
      status: record.status ?? 'active',
      notes: record.notes ?? ''
    }
  } catch (err) {
    console.error('Failed to load the animal for editing:', err)
    generalError.value = 'Failed to load this animal.'
  } finally {
    loadingRecord.value = false
  }
}

onMounted(() => {
  fetchFarms()
  fetchAnimalTypes()
  fetchBreeds()
  fetchAnimalGroups()
  fetchTreatmentPlans()
  fetchExistingAnimals()
  loadAnimalForEdit()
})
</script>
