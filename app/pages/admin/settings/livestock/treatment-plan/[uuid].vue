<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        to="/admin/settings/livestock"
        class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        Back to Livestock Settings
      </NuxtLink>
    </div>

    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">{{ isEditing ? 'Edit Vaccination Plan' : 'New Vaccination Plan' }}</h1>
      <p class="text-gray-600 mt-1">
        Define a reusable vaccination/treatment schedule. When applied to a flock or animal,
        reminders are auto-created based on the acquisition or birth date.
      </p>
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

    <form @submit.prevent="handleSubmit">
      <!-- Plan Details Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Plan Details</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <Label for="name" class="block text-sm font-semibold text-gray-700">
              Plan Name <span class="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="e.g. Layers Chicken Vaccination Schedule"
              required
              class="w-full"
            />
          </div>

          <div class="space-y-1">
            <Label for="animal_type_id" class="block text-sm font-semibold text-gray-700">Animal Type</Label>
            <select
              id="animal_type_id"
              v-model="form.animal_type_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Any animal type (generic plan)</option>
              <option v-for="type in animalTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
            <p class="text-xs text-gray-400">Shown when adding a flock/animal of this type</p>
          </div>
        </div>
      </div>

      <!-- Steps Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-lg font-semibold text-gray-900">Vaccination Steps</h2>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            @click="addActivity"
          >
            <Plus class="w-4 h-4" />
            Add Step
          </button>
        </div>
        <p class="text-sm text-gray-500 mb-5">
          Each step is due at a given animal age. For example: "Gumboro vaccine at 2 weeks, in drinking water".
        </p>

        <!-- Empty State -->
        <div v-if="form.activities.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
          <Syringe class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-sm text-gray-500 font-medium">No steps yet</p>
          <p class="text-xs text-gray-400 mt-1">Click "Add Step" to start building your plan</p>
        </div>

        <!-- Steps Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine / Treatment</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disease</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">At Age</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Unit</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Priority</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  <span class="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="(activity, idx) in form.activities" :key="idx" class="group hover:bg-gray-50">
                <td class="px-4 py-3 align-top">
                  <span
                    class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                    :class="priorityDotClass(activity.priority)"
                  >
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="px-4 py-3 align-top">
                  <Input v-model="activity.vaccine" type="text" placeholder="e.g. Gumboro" required class="w-full" />
                </td>
                <td class="px-4 py-3 align-top">
                  <input
                    v-model="activity.disease"
                    type="text"
                    placeholder="e.g. Infectious bursal disease"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                </td>
                <td class="px-4 py-3 align-top">
                  <input
                    v-model.number="activity.offset_value"
                    type="number"
                    min="0"
                    placeholder="2"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                </td>
                <td class="px-4 py-3 align-top">
                  <select
                    v-model="activity.offset_unit"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </td>
                <td class="px-4 py-3 align-top">
                  <input
                    v-model="activity.route"
                    type="text"
                    placeholder="e.g. Drinking water, Injection"
                    list="route-suggestions"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                </td>
                <td class="px-4 py-3 align-top">
                  <select
                    v-model.number="activity.priority"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option :value="1">Low</option>
                    <option :value="2">Medium</option>
                    <option :value="3">High</option>
                    <option :value="4">Critical</option>
                  </select>
                </td>
                <td class="px-4 py-3 align-top text-right">
                  <button
                    type="button"
                    class="text-gray-300 hover:text-red-500 transition-colors group-hover:text-red-400"
                    title="Remove step"
                    @click="removeActivity(idx)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <datalist id="route-suggestions">
            <option value="Drinking water" />
            <option value="Injection" />
            <option value="Eye drop" />
            <option value="Spray" />
            <option value="Oral" />
            <option value="Wing web" />
          </datalist>
        </div>

        <button
          v-if="form.activities.length > 0"
          type="button"
          class="mt-3 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-green-300 hover:text-green-600 transition-colors flex items-center justify-center gap-1"
          @click="addActivity"
        >
          <Plus class="w-4 h-4" />
          Add another step
        </button>
      </div>

      <!-- Timeline Preview Card -->
      <div v-if="form.activities.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Timeline Preview</h2>
        <p class="text-sm text-gray-500 mb-5">How reminders will be scheduled from the day the animals arrive (or are born)</p>

        <div class="relative">
          <div class="absolute left-4 top-4 bottom-4 w-0.5 bg-green-200"></div>

          <div class="relative flex items-start gap-4 pb-5">
            <div class="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
              <Bird class="w-4 h-4" />
            </div>
            <div class="pt-1">
              <p class="text-sm font-semibold text-green-700">Arrival / Birth</p>
              <p class="text-xs text-gray-400">Day 0</p>
            </div>
          </div>

          <div
            v-for="(activity, idx) in sortedActivities"
            :key="idx"
            class="relative flex items-start gap-4 pb-5 last:pb-0"
          >
            <div
              class="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              :class="priorityDotClass(activity.priority)"
            >
              {{ activity.originalIndex + 1 }}
            </div>
            <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h5 class="text-sm font-medium text-gray-900">
                  {{ activity.vaccine || 'Untitled' }}
                  <span v-if="activity.disease" class="text-gray-400 font-normal">— {{ activity.disease }}</span>
                </h5>
                <div class="flex items-center gap-2">
                  <span v-if="activity.route" class="text-xs text-gray-500">{{ activity.route }}</span>
                  <span class="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    <Clock class="w-3 h-3" />
                    {{ activity.offset_value }} {{ activity.offset_unit }}
                  </span>
                  <span class="text-xs text-gray-400">(day {{ toDays(activity.offset_value, activity.offset_unit) }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pb-8">
        <NuxtLink
          to="/admin/settings/livestock"
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
            <Syringe class="w-4 h-4 mr-2" />
            {{ isEditing ? 'Update Plan' : 'Create Plan' }}
          </span>
        </Button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import {
  AlertCircle, Bird, CheckCircle, ChevronLeft, Clock, Plus, Syringe, Trash2
} from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

interface Activity {
  id?: number
  vaccine: string
  disease: string
  route: string
  offset_value: number
  offset_unit: 'days' | 'weeks' | 'months'
  priority: number
  notes?: string
}

interface AnimalType {
  id: number
  name: string
}

const { $apiFetch } = useNuxtApp()
const { getReference } = useReferenceData()
const route = useRoute()
const router = useRouter()

const uuid = computed(() => route.params.uuid as string)
const isEditing = computed(() => uuid.value !== 'new')

const animalTypes = ref<AnimalType[]>([])
const submitting = ref(false)
const successMessage = ref<string | null>(null)
const generalError = ref<string | null>(null)

const defaultActivity = (): Activity => ({
  vaccine: '',
  disease: '',
  route: '',
  offset_value: 1,
  offset_unit: 'weeks',
  priority: 3
})

const form = ref({
  name: '',
  animal_type_id: '' as number | '',
  status: 'active' as 'active' | 'inactive',
  activities: [defaultActivity()] as Activity[]
})

const addActivity = () => form.value.activities.push(defaultActivity())
const removeActivity = (idx: number) => form.value.activities.splice(idx, 1)

const toDays = (value: number, unit: string) => {
  if (unit === 'weeks') return value * 7
  if (unit === 'months') return value * 30
  return value
}

/** age_days back to the friendliest value/unit for editing. */
const fromDays = (days: number): { offset_value: number, offset_unit: Activity['offset_unit'] } => {
  if (days > 0 && days % 30 === 0) return { offset_value: days / 30, offset_unit: 'months' }
  if (days > 0 && days % 7 === 0) return { offset_value: days / 7, offset_unit: 'weeks' }
  return { offset_value: days, offset_unit: 'days' }
}

const sortedActivities = computed(() =>
  form.value.activities
    .map((a, i) => ({ ...a, originalIndex: i }))
    .sort((a, b) => toDays(a.offset_value, a.offset_unit) - toDays(b.offset_value, b.offset_unit)))

const priorityDotClass = (priority: number) => {
  const classes: Record<number, string> = {
    1: 'bg-gray-200 text-gray-600',
    2: 'bg-blue-200 text-blue-700',
    3: 'bg-amber-200 text-amber-700',
    4: 'bg-red-200 text-red-700'
  }
  return classes[priority] || classes[2]!
}

const fetchAnimalTypes = async () => {
  try {
    const { data } = await getReference<AnimalType>('animal_types')
    animalTypes.value = data
  } catch (err) {
    console.error('Failed to load animal types:', err)
  }
}

// Editing: the (empty) form renders immediately and fills when this lands.
const fetchPlan = async () => {
  if (!isEditing.value) return
  try {
    const response = await $apiFetch<any>(`/api/v1/settings/animals/treatment-plans/${uuid.value}`)
    const plan = response?.data ?? response
    form.value = {
      name: plan.name,
      animal_type_id: plan.animal_type_id || '',
      status: plan.status ?? 'active',
      activities: (plan.activities || []).map((a: any) => ({
        id: a.id,
        vaccine: a.vaccine,
        disease: a.disease || '',
        route: a.route || '',
        priority: a.priority ?? 2,
        ...fromDays(a.age_days ?? 0)
      }))
    }
  } catch (err: any) {
    generalError.value = 'Failed to load plan: ' + (err.message || 'Unknown error')
  }
}

const handleSubmit = async () => {
  generalError.value = null
  successMessage.value = null
  submitting.value = true

  try {
    await $apiFetch('/sanctum/csrf-cookie')

    const payload = {
      name: form.value.name,
      animal_type_id: form.value.animal_type_id || null,
      status: form.value.status,
      activities: form.value.activities.map(a => ({
        id: a.id,
        vaccine: a.vaccine,
        disease: a.disease || null,
        route: a.route || null,
        offset_value: a.offset_value,
        offset_unit: a.offset_unit,
        priority: a.priority
      }))
    }

    if (isEditing.value) {
      await $apiFetch(`/api/v1/settings/animals/treatment-plans/${uuid.value}`, {
        method: 'PUT',
        body: payload
      })
      successMessage.value = 'Vaccination plan updated successfully!'
    } else {
      await $apiFetch('/api/v1/settings/animals/treatment-plans', {
        method: 'POST',
        body: payload
      })
      successMessage.value = 'Vaccination plan created successfully!'
      await router.push('/admin/settings/livestock')
    }
  } catch (err: any) {
    generalError.value = 'Failed to save plan: '
      + (err?.data?.errors ? Object.values(err.data.errors).flat().join(' ') : err.message || 'Unknown error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAnimalTypes()
  fetchPlan()
})
</script>
