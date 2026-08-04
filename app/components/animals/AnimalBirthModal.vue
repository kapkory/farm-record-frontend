<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>

      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div class="flex items-start justify-between border-b border-gray-200 p-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Register Birth</h3>
              <p class="mt-1 text-sm text-gray-500">{{ contextLine }}</p>
            </div>
            <button type="button" @click="$emit('close')" class="text-gray-400 transition-colors hover:text-gray-600">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Global errors -->
          <div v-if="errorList.length" class="mx-4 mt-4 rounded-md bg-red-50 p-3">
            <p class="text-sm font-medium text-red-800">Please fix the following:</p>
            <ul class="mt-1 list-inside list-disc text-sm text-red-700">
              <li v-for="(err, i) in errorList" :key="i">{{ err }}</li>
            </ul>
          </div>
          <div v-else-if="submitError" class="mx-4 mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {{ submitError }}
          </div>

          <form @submit.prevent="submit" class="space-y-5 p-4">
            <!-- Birth date -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Date of Birth *</Label>
                <Input v-model="birthForm.birth_date" type="date" class="w-full" :max="today" required />
                <p v-if="formErrors.birth_date" class="mt-1 text-xs text-red-600">{{ formErrors.birth_date }}</p>
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Stillborn / died at birth</Label>
                <Input v-model.number="birthForm.stillborn_count" type="number" min="0" max="30" class="w-full" />
                <p class="mt-1 text-xs text-gray-500">Counted in the birth record; no animal is created for these.</p>
                <p v-if="formErrors.stillborn_count" class="mt-1 text-xs text-red-600">{{ formErrors.stillborn_count }}</p>
              </div>
            </div>

            <!-- Offspring rows -->
            <div>
              <div class="mb-2 flex items-center justify-between">
                <Label class="text-sm font-medium text-gray-700">Live offspring</Label>
                <button
                  type="button"
                  @click="addOffspring"
                  class="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                >
                  <Plus class="h-3 w-3" /> Add offspring
                </button>
              </div>

              <p v-if="formErrors.offspring" class="mb-2 text-xs text-red-600">{{ formErrors.offspring }}</p>

              <div v-if="!birthForm.offspring.length" class="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                No live offspring — record the stillborn count above, or add an offspring.
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="(calf, index) in birthForm.offspring"
                  :key="calf.uuid"
                  class="rounded-md border border-gray-200 bg-gray-50 p-3"
                >
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">#{{ index + 1 }}</span>
                    <button
                      type="button"
                      @click="removeOffspring(index)"
                      class="text-gray-400 transition-colors hover:text-red-600"
                      aria-label="Remove this offspring"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>

                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <Label class="mb-1 block text-xs font-medium text-gray-600">Sex *</Label>
                      <select
                        v-model="calf.gender"
                        class="w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="unknown">Unknown</option>
                      </select>
                      <p v-if="offspringErrors[index]?.gender" class="mt-1 text-xs text-red-600">{{ offspringErrors[index]?.gender }}</p>
                    </div>
                    <div>
                      <Label class="mb-1 block text-xs font-medium text-gray-600">Tag number</Label>
                      <Input v-model="calf.tag_number" type="text" class="w-full" placeholder="Auto-assigned" />
                      <p v-if="offspringErrors[index]?.tag_number" class="mt-1 text-xs text-red-600">{{ offspringErrors[index]?.tag_number }}</p>
                    </div>
                    <div>
                      <Label class="mb-1 block text-xs font-medium text-gray-600">Name</Label>
                      <Input v-model="calf.name" type="text" class="w-full" placeholder="Same as tag" />
                      <p v-if="offspringErrors[index]?.name" class="mt-1 text-xs text-red-600">{{ offspringErrors[index]?.name }}</p>
                    </div>
                  </div>

                  <div class="mt-2">
                    <Input v-model="calf.notes" type="text" class="w-full" placeholder="Notes (birth weight, assistance needed, …)" />
                  </div>
                </div>
              </div>

              <p class="mt-2 text-xs text-gray-500">
                Leave the tag blank and the next number in the sequence is assigned automatically.
                Each newborn inherits {{ damLabel }}'s farm, group, species and breed, and is linked to
                {{ sireLabel }} as sire.
              </p>
            </div>

            <!-- Treatment plan -->
            <label class="flex cursor-pointer items-start gap-2">
              <input v-model="birthForm.inherit_treatment_plan" type="checkbox" class="mt-0.5 rounded text-green-500 focus:ring-green-500" />
              <span class="text-sm text-gray-700">
                Apply the mother's vaccination plan to each newborn
                <span class="block text-xs text-gray-500">Creates the plan's tasks dated from the date of birth.</span>
              </span>
            </label>

            <!-- Submit -->
            <div class="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-gray-500">Recording: <span class="font-medium text-gray-900">{{ summary }}</span></p>
              <div class="flex items-center justify-end gap-3">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting" class="flex items-center">
                    <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Recording...
                  </span>
                  <span v-else>Record Birth</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { Plus, Trash2, X } from 'lucide-vue-next'
import type { BreedingRecord } from '~/composables/useAnimalBreedings'

const props = defineProps<{
  breeding: BreedingRecord
  animalUuid: string
  damName?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', breeding: BreedingRecord, synced: boolean): void
}>()

const {
  birthForm,
  submitting,
  submitError,
  formErrors,
  offspringErrors,
  errorList,
  summary,
  addOffspring,
  removeOffspring,
  registerBirth
} = useBirthRegistration(props.breeding, props.animalUuid)

const today = new Date().toISOString().split('T')[0]

const damLabel = computed(() => props.damName || props.breeding.dam?.name || 'the mother')

const sireLabel = computed(() => {
  if (props.breeding.sire_type === 'ai') return props.breeding.ai_bull_name || 'the AI bull'
  return props.breeding.sire?.name || 'the recorded sire'
})

const contextLine = computed(() => {
  const expected = props.breeding.expected_birth_date_human || props.breeding.expected_birth_date
  const served = props.breeding.service_date_human || props.breeding.service_date
  return `${damLabel.value} × ${sireLabel.value} · served ${served}${expected ? ` · expected ${expected}` : ''}`
})

const submit = async () => {
  const result = await registerBirth()
  if (!result.ok || !result.breeding) return
  emit('saved', result.breeding, result.synced)
}
</script>
