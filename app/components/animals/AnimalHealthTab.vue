<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-gray-900">Health Records</h3>
          <p class="mt-0.5 text-sm text-gray-500">All health events, vaccinations, and checkups for this animal.</p>
        </div>
        <Button type="button" @click="openModal" class="inline-flex items-center gap-2">
          <Plus class="h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading health records...</span>
      </div>

      <div v-else-if="loadError" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load health records</p>
        <p class="mt-1 text-sm">{{ loadError }}</p>
        <button @click="fetchHealthRecords" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Vet</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Outcome</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Next Due</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="record in healthRecords" :key="record.uuid" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ formatDate(record.date) }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 capitalize">{{ record.type }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ record.description }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ record.vet_name || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="[
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  record.outcome === 'resolved' ? 'bg-green-100 text-green-800' :
                  record.outcome === 'ongoing' ? 'bg-amber-100 text-amber-800' :
                  record.outcome === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ record.outcome }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {{ record.next_due_date ? formatDate(record.next_due_date) : '—' }}
              </td>
            </tr>
            <tr v-if="!healthRecords.length">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No health records yet. Add the first record above.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Add Health Record</h3>
                <p class="mt-1 text-sm text-gray-500">Record a health event, vaccination, or checkup.</p>
              </div>
              <button type="button" @click="closeModal" class="text-gray-400 transition-colors hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="saveHealthRecord" class="space-y-4 p-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Date *</Label>
                  <Input v-model="healthForm.date" type="date" required class="w-full" />
                  <p v-if="formErrors.date" class="mt-1 text-xs text-red-600">{{ formErrors.date }}</p>
                </div>
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Type *</Label>
                  <select
                    v-model="healthForm.type"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select type</option>
                    <option value="checkup">Checkup</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="illness">Illness</option>
                    <option value="injury">Injury</option>
                    <option value="surgery">Surgery</option>
                    <option value="deworming">Deworming</option>
                  </select>
                  <p v-if="formErrors.type" class="mt-1 text-xs text-red-600">{{ formErrors.type }}</p>
                </div>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Description *</Label>
                <textarea
                  v-model="healthForm.description"
                  required
                  rows="2"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the health event..."
                ></textarea>
                <p v-if="formErrors.description" class="mt-1 text-xs text-red-600">{{ formErrors.description }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Vet Name</Label>
                  <Input v-model="healthForm.vet_name" type="text" class="w-full" />
                  <p v-if="formErrors.vet_name" class="mt-1 text-xs text-red-600">{{ formErrors.vet_name }}</p>
                </div>
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Outcome</Label>
                  <select
                    v-model="healthForm.outcome"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="resolved">Resolved</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                  <p v-if="formErrors.outcome" class="mt-1 text-xs text-red-600">{{ formErrors.outcome }}</p>
                </div>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Next Due Date</Label>
                <Input v-model="healthForm.next_due_date" type="date" class="w-full" />
                <p v-if="formErrors.next_due_date" class="mt-1 text-xs text-red-600">{{ formErrors.next_due_date }}</p>
              </div>

              <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p class="font-medium">Please fix the following before saving:</p>
                <p class="mt-1">{{ submitError }}</p>
                <ul v-if="errorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in errorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting">Saving...</span>
                  <span v-else>Add Record</span>
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
import { Plus, X } from 'lucide-vue-next'

const props = defineProps<{ animalUuid: string }>()

const {
  healthRecords,
  loading,
  loadError,
  submitting,
  submitError,
  showModal,
  formErrors,
  errorList,
  healthForm,
  openModal,
  closeModal,
  fetchHealthRecords,
  saveHealthRecord
} = useAnimalHealthRecords(props.animalUuid)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
</script>
