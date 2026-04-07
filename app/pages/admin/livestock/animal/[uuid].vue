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
              <span v-if="tab.count !== undefined" class="ml-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <div class="p-4">
          <!-- Health Records Tab -->
          <div v-if="activeTab === 'health'">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-sm font-medium text-gray-700">Health Records</h3>
              <Button size="sm" @click="openHealthModal">
                <Plus class="w-3 h-3 mr-1" />
                Add Record
              </Button>
            </div>

            <div v-if="healthRecords.length === 0" class="text-center py-8">
              <HeartPulse class="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500">No health records yet</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vet</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="record in healthRecords" :key="record.uuid" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ formatDate(record.date) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 capitalize">{{ record.type }}</td>
                    <td class="px-4 py-3 text-sm text-gray-700">{{ record.description }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ record.vet_name || '-' }}</td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'px-2 py-0.5 text-xs font-semibold rounded-full',
                        record.outcome === 'resolved' ? 'bg-green-100 text-green-800' :
                        record.outcome === 'ongoing' ? 'bg-amber-100 text-amber-800' :
                        record.outcome === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      ]">
                        {{ record.outcome }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ record.next_due_date ? formatDate(record.next_due_date) : '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Treatments Tab -->
          <div v-if="activeTab === 'treatments'">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-sm font-medium text-gray-700">Treatments Applied</h3>
              <Button size="sm" @click="openTreatmentModal">
                <Plus class="w-3 h-3 mr-1" />
                Add Treatment
              </Button>
            </div>

            <div v-if="treatments.length === 0" class="text-center py-8">
              <Syringe class="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500">No treatments recorded yet</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Treatment</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Administered By</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="treatment in treatments" :key="treatment.uuid" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ formatDate(treatment.date) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ treatment.treatment_type }}</td>
                    <td class="px-4 py-3 text-sm text-gray-700">{{ treatment.product_name || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ treatment.dosage || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ treatment.administered_by || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ treatment.notes || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Activity/Timeline Tab -->
          <div v-if="activeTab === 'activity'">
            <div class="text-center py-8">
              <Clock class="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500">Activity timeline coming soon</p>
              <p class="text-xs text-gray-400 mt-1">Weight changes, movements, and key events will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Health Record Modal -->
    <Teleport to="body">
      <div v-if="showHealthModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="showHealthModal = false"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex items-center justify-between p-4 border-b">
              <h3 class="text-lg font-semibold text-gray-900">Add Health Record</h3>
              <button @click="showHealthModal = false" class="text-gray-400 hover:text-gray-500">
                <X class="w-5 h-5" />
              </button>
            </div>
            <form @submit.prevent="submitHealthRecord" class="p-4 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-1">Date *</Label>
                  <Input v-model="healthForm.date" type="date" required class="w-full" />
                </div>
                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-1">Type *</Label>
                  <select
                    v-model="healthForm.type"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select</option>
                    <option value="checkup">Checkup</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="illness">Illness</option>
                    <option value="injury">Injury</option>
                    <option value="surgery">Surgery</option>
                    <option value="deworming">Deworming</option>
                  </select>
                </div>
              </div>
              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-1">Description *</Label>
                <textarea
                  v-model="healthForm.description"
                  required
                  rows="2"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the health event..."
                ></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-1">Vet Name</Label>
                  <Input v-model="healthForm.vet_name" type="text" class="w-full" />
                </div>
                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-1">Outcome</Label>
                  <select
                    v-model="healthForm.outcome"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="resolved">Resolved</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-1">Next Due Date</Label>
                <Input v-model="healthForm.next_due_date" type="date" class="w-full" />
              </div>
              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" @click="showHealthModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">Cancel</button>
                <Button type="submit">Add Record</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Treatment Modal -->
    <Teleport to="body">
      <div v-if="showTreatmentModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="showTreatmentModal = false"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex items-center justify-between p-4 border-b">
              <h3 class="text-lg font-semibold text-gray-900">Add Treatment</h3>
              <button @click="showTreatmentModal = false" class="text-gray-400 hover:text-gray-500">
                <X class="w-5 h-5" />
              </button>
            </div>
            <form @submit.prevent="submitTreatment" class="p-4 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-1">Date *</Label>
                  <Input v-model="treatmentForm.date" type="date" required class="w-full" />
                </div>
                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-1">Treatment Type *</Label>
                  <Input v-model="treatmentForm.treatment_type" type="text" required placeholder="e.g. Vaccination" class="w-full" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-1">Product Name</Label>
                  <Input v-model="treatmentForm.product_name" type="text" class="w-full" />
                </div>
                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-1">Dosage</Label>
                  <Input v-model="treatmentForm.dosage" type="text" placeholder="e.g. 5ml" class="w-full" />
                </div>
              </div>
              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-1">Administered By</Label>
                <Input v-model="treatmentForm.administered_by" type="text" class="w-full" />
              </div>
              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-1">Notes</Label>
                <textarea
                  v-model="treatmentForm.notes"
                  rows="2"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>
              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" @click="showTreatmentModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">Cancel</button>
                <Button type="submit">Add Treatment</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

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
import { ArrowLeft, Tag, Users, Pencil, Trash2, Plus, HeartPulse, Syringe, Clock, X } from 'lucide-vue-next'
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

interface HealthRecord {
  uuid: string
  date: string
  type: string
  description: string
  vet_name: string | null
  outcome: string
  next_due_date: string | null
  cost: number | null
}

interface Treatment {
  uuid: string
  date: string
  treatment_type: string
  product_name: string | null
  dosage: string | null
  administered_by: string | null
  notes: string | null
}

const animal = ref<Animal | null>(null)
const healthRecords = ref<HealthRecord[]>([])
const treatments = ref<Treatment[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const activeTab = ref('health')
const showDeleteConfirm = ref(false)
const showHealthModal = ref(false)
const showTreatmentModal = ref(false)

const tabs = computed(() => [
  { key: 'health', label: 'Health Records', count: healthRecords.value.length },
  { key: 'treatments', label: 'Treatments', count: treatments.value.length },
  { key: 'activity', label: 'Activity' }
])

const healthForm = ref({
  date: new Date().toISOString().split('T')[0],
  type: '',
  description: '',
  vet_name: '',
  outcome: 'resolved',
  next_due_date: ''
})

const treatmentForm = ref({
  date: new Date().toISOString().split('T')[0],
  treatment_type: '',
  product_name: '',
  dosage: '',
  administered_by: '',
  notes: ''
})

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

const openHealthModal = () => {
  healthForm.value = {
    date: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    vet_name: '',
    outcome: 'resolved',
    next_due_date: ''
  }
  showHealthModal.value = true
}

const openTreatmentModal = () => {
  treatmentForm.value = {
    date: new Date().toISOString().split('T')[0],
    treatment_type: '',
    product_name: '',
    dosage: '',
    administered_by: '',
    notes: ''
  }
  showTreatmentModal.value = true
}

const submitHealthRecord = async () => {
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: HealthRecord }>(`/api/v1/livestock/${uuid}/health-records`, {
        method: 'POST',
        body: healthForm.value
      })
      healthRecords.value.unshift(response.data)
    } else {
      healthRecords.value.unshift({
        uuid: `temp-${Date.now()}`,
        date: healthForm.value.date!,
        type: healthForm.value.type,
        description: healthForm.value.description,
        vet_name: healthForm.value.vet_name || null,
        outcome: healthForm.value.outcome,
        next_due_date: healthForm.value.next_due_date || null,
        cost: null
      })
    }
    showHealthModal.value = false
  } catch (err: any) {
    console.error('Failed to add health record:', err)
    alert('Failed to save: ' + (err.message || 'Unknown error'))
  }
}

const submitTreatment = async () => {
  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Treatment }>(`/api/v1/livestock/${uuid}/treatments`, {
        method: 'POST',
        body: treatmentForm.value
      })
      treatments.value.unshift(response.data)
    } else {
      treatments.value.unshift({
        uuid: `temp-${Date.now()}`,
        date: treatmentForm.value.date!,
        treatment_type: treatmentForm.value.treatment_type,
        product_name: treatmentForm.value.product_name || null,
        dosage: treatmentForm.value.dosage || null,
        administered_by: treatmentForm.value.administered_by || null,
        notes: treatmentForm.value.notes || null
      })
    }
    showTreatmentModal.value = false
  } catch (err: any) {
    console.error('Failed to add treatment:', err)
    alert('Failed to save: ' + (err.message || 'Unknown error'))
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

const fetchHealthRecords = async () => {
  try {
    if (isOnline.value) {
      const response = await $apiFetch<{ data: HealthRecord[] }>(`/api/v1/livestock/${uuid}/health-records`)
      healthRecords.value = response.data || response as unknown as HealthRecord[]
    }
  } catch (err) {
    console.error('Failed to fetch health records:', err)
  }
}

onMounted(() => {
  fetchAnimal()
  fetchHealthRecords()
})
</script>
