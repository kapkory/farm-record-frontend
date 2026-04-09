<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4">
        <Button type="button" @click="openModal" class="inline-flex items-center gap-2">
          <Plus class="h-4 w-4" />
          New Treatment
        </Button>
        <p class="mt-1 text-sm text-gray-500">See all treatment records already captured for this animal.</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading treatments...</span>
      </div>

      <div v-else-if="loadError" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load treatments</p>
        <p class="mt-1 text-sm">{{ loadError }}</p>
        <button @click="fetchTreatments" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Treatment Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Details</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Retreat Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="record in treatments" :key="record.uuid" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ record.date_human || record.date || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ mapTypeName(record) }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ record.details || '—' }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ record.retreat_date ?? '—' }}</td>
              <td class="max-w-sm px-6 py-4 text-sm text-gray-500">{{ record.notes || '—' }}</td>
            </tr>
            <tr v-if="!treatments.length">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No treatments recorded yet. Add the first treatment above.
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
          <div class="relative w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">New Treatment</h3>
                <p class="mt-1 text-sm text-gray-500">Record what you are doing on this animal, when you did it, and whether money was spent.</p>
              </div>
              <button type="button" @click="closeModal" class="text-gray-400 transition-colors hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="saveTreatment" class="space-y-5 p-6">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                  <Label for="treatment_details" class="mb-1 block text-sm font-medium text-gray-700">Details</Label>
                  <Input id="treatment_details" v-model="treatmentForm.details" type="text" class="w-full" placeholder="Example: Deworming with Ivermectin" />
                  <p v-if="formErrors.details" class="mt-1 text-xs text-red-600">{{ formErrors.details }}</p>
                </div>

                <div>
                  <Label for="treatment_type_id" class="mb-1 block text-sm font-medium text-gray-700">Treatment Type</Label>
                  <div class="relative">
                    <Input
                      id="treatment_type_id"
                      v-model="treatmentTypeSearch"
                      type="text"
                      autocomplete="off"
                      class="w-full"
                      placeholder="Search treatment type"
                      @focus="showTreatmentTypeResults = true"
                      @input="handleTreatmentTypeSearch"
                    />
                    <div
                      v-if="showTreatmentTypeResults"
                      class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                    >
                      <button
                        v-for="type in searchedTreatmentTypes"
                        :key="type.id"
                        type="button"
                        class="block w-full border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                        @click="selectTreatmentType(type)"
                      >
                        <span class="block text-sm font-medium text-gray-900">{{ type.name }}</span>
                        <span v-if="type.description" class="block text-xs text-gray-500">{{ type.description }}</span>
                      </button>
                      <div v-if="!searchedTreatmentTypes.length" class="px-3 py-2 text-sm text-gray-500">
                        No matching treatment types found.
                      </div>
                    </div>
                  </div>
                  <p v-if="formErrors.treatment_type_id" class="mt-1 text-xs text-red-600">{{ formErrors.treatment_type_id }}</p>
                  <p v-if="selectedTreatmentType?.description" class="mt-1 text-xs text-gray-500">{{ selectedTreatmentType.description }}</p>
                </div>

                <div>
                  <Label for="treatment_date" class="mb-1 block text-sm font-medium text-gray-700">Date of Treatment</Label>
                  <Input id="treatment_date" v-model="treatmentForm.date" type="date" class="w-full" />
                  <p v-if="formErrors.date" class="mt-1 text-xs text-red-600">{{ formErrors.date }}</p>
                </div>

                <div>
                  <Label for="retreat_date" class="mb-1 block text-sm font-medium text-gray-700">Retreat Date</Label>
                  <Input id="retreat_date" v-model="treatmentForm.retreat_date" type="date" class="w-full" />
                  <p v-if="formErrors.retreat_date" class="mt-1 text-xs text-red-600">{{ formErrors.retreat_date }}</p>
                </div>
              </div>

              <div>
                <Label for="treatment_notes" class="mb-1 block text-sm font-medium text-gray-700">Notes</Label>
                <textarea id="treatment_notes" v-model="treatmentForm.notes" rows="4" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter quantity used, drugs used, and anything else important"></textarea>
                <p v-if="formErrors.notes" class="mt-1 text-xs text-red-600">{{ formErrors.notes }}</p>
              </div>

              <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center">
                <label class="inline-flex items-center gap-3">
                  <input v-model="treatmentForm.record_expense" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <span class="text-sm font-medium text-gray-900">Record Expense</span>
                </label>
                <div v-if="treatmentForm.record_expense" class="sm:w-64">
                  <Input id="treatment_expense_amount" v-model="treatmentForm.expense_amount" type="number" min="0" step="0.01" class="w-full" placeholder="Expense Amount" />
                  <p v-if="formErrors.expense_amount" class="mt-1 text-xs text-red-600">{{ formErrors.expense_amount }}</p>
                </div>
              </div>

              <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p class="font-medium">Please fix the following before saving:</p>
                <p class="mt-1">{{ submitError }}</p>
                <ul v-if="errorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in errorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" @click="closeModal" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting">Saving...</span>
                  <span v-else>Save Treatment</span>
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

const props = defineProps<{ animalUuid: string; trackingType: 'individual' | 'group' }>()

const {
  treatments,
  loading,
  loadError,
  submitting,
  submitError,
  showModal,
  formErrors,
  errorList,
  treatmentForm,
  treatmentTypeSearch,
  showTreatmentTypeResults,
  searchedTreatmentTypes,
  selectedTreatmentType,
  mapTypeName,
  openModal,
  closeModal,
  handleTreatmentTypeSearch,
  selectTreatmentType,
  fetchTreatments,
  saveTreatment
} = useAnimalTreatments(props.animalUuid, props.trackingType)
</script>
