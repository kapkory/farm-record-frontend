<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4">
        <Button type="button" @click="openModal" class="inline-flex items-center gap-2">
          <Plus class="h-4 w-4" />
          New Breeding
        </Button>
        <p class="mt-1 text-sm text-gray-500">Record breeding events for this animal — natural mating, AI, or embryo transfer.</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading breeding records...</span>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load breeding records</p>
        <p class="mt-1 text-sm">{{ loadError }}</p>
        <button @click="fetchBreedings" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Service Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Sire Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Sire / AI Info</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Expected Birth</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Notes</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="record in breedings" :key="record.uuid" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {{ record.service_date_human || record.service_date || '—' }}
                <span
                  v-if="record.synced === false"
                  class="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                  title="Pending sync — will sync when online"
                >
                  <CloudOff class="mr-0.5 h-2.5 w-2.5" />
                  pending
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="[
                  'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                  record.sire_type === 'natural' ? 'bg-green-100 text-green-700' :
                  record.sire_type === 'ai' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                ]">
                  {{ sireTypeLabel(record.sire_type) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                <template v-if="record.sire_type === 'ai'">
                  <p class="font-medium text-gray-900">{{ record.ai_bull_name || '—' }}</p>
                  <p class="text-xs text-gray-500">Straw: {{ record.ai_straw_code || '—' }}</p>
                  <p v-if="record.ai_technician" class="text-xs text-gray-400">Tech: {{ record.ai_technician }}</p>
                </template>
                <template v-else-if="record.sire">
                  <p class="font-medium text-gray-900">{{ record.sire.name || '—' }}</p>
                  <p v-if="record.sire.tag_number" class="text-xs text-gray-500">{{ record.sire.tag_number }}</p>
                </template>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <template v-if="record.status === 'born'">
                  <p class="font-medium text-gray-900">
                    Born {{ record.actual_birth_date_human || record.actual_birth_date || '—' }}
                  </p>
                  <div v-if="record.offspring?.length" class="mt-1 flex flex-wrap gap-1">
                    <NuxtLink
                      v-for="calf in record.offspring"
                      :key="calf.uuid"
                      :to="`/admin/livestock/animal/${calf.uuid}`"
                      class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      {{ calf.name || calf.tag_number || 'Offspring' }}
                    </NuxtLink>
                  </div>
                  <p v-if="record.stillborn_count" class="mt-1 text-xs text-gray-500">
                    {{ record.stillborn_count }} stillborn
                  </p>
                </template>
                <template v-else>
                  <p>{{ record.expected_birth_date_human || record.expected_birth_date || '—' }}</p>
                  <p v-if="record.expected_birth_date" class="mt-0.5 text-xs" :class="birthCountdownClass(record)">
                    {{ birthCountdownLabel(record) }}
                  </p>
                </template>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="[
                  'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                  record.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  record.status === 'born' ? 'bg-green-100 text-green-800' :
                  record.status === 'aborted' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ statusLabel(record.status) }}
                </span>
              </td>
              <td class="max-w-xs truncate px-6 py-4 text-sm text-gray-500" :title="record.notes ?? undefined">
                {{ record.notes || '—' }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                <div v-if="record.status === 'pending'" class="flex items-center justify-end gap-2">
                  <Button type="button" class="px-2.5 py-1 text-xs" @click="openBirthModal(record)">
                    Register Birth
                  </Button>
                  <select
                    value=""
                    aria-label="Other outcome"
                    @change="(e: Event) => resolveWithoutBirth(record, e.target as HTMLSelectElement)"
                    class="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Other outcome…</option>
                    <option value="aborted">Aborted</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <span v-else class="text-xs text-gray-400">—</span>
              </td>
            </tr>
            <tr v-if="!breedings.length">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No breeding records yet. Record the first breeding event above.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New Breeding Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">New Breeding Record</h3>
                <p class="mt-1 text-sm text-gray-500">Record a natural mating, AI, or embryo transfer event.</p>
              </div>
              <button type="button" @click="closeModal" class="text-gray-400 transition-colors hover:text-gray-600">
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

            <form @submit.prevent="saveBreeding" class="space-y-4 p-4">
              <!-- Sire Type -->
              <div>
                <Label class="mb-2 block text-sm font-medium text-gray-700">Breeding Method *</Label>
                <div class="flex gap-4">
                  <label v-for="opt in (['natural', 'ai', 'embryo'] as const)" :key="opt" class="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      :value="opt"
                      v-model="breedingForm.sire_type"
                      class="text-green-500 focus:ring-green-500"
                    />
                    <span class="text-sm text-gray-700">{{ sireTypeLabel(opt) }}</span>
                  </label>
                </div>
                <p v-if="formErrors.sire_type" class="mt-1 text-xs text-red-600">{{ formErrors.sire_type }}</p>
              </div>

              <!-- Sire selection (natural / embryo) -->
              <div v-if="breedingForm.sire_type === 'natural' || breedingForm.sire_type === 'embryo'">
                <Label class="mb-1 block text-sm font-medium text-gray-700">Select Sire</Label>
                <div class="relative">
                  <Input
                    v-model="sireSearch"
                    type="text"
                    class="w-full"
                    placeholder="Search by name or tag..."
                    @input="handleSireSearch"
                    @focus="showSireResults = true"
                  />
                  <div
                    v-if="showSireResults && filteredSires.length"
                    class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                  >
                    <button
                      v-for="sire in filteredSires"
                      :key="sire.uuid"
                      type="button"
                      class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-green-50"
                      @click="selectSire(sire)"
                    >
                      <span class="font-medium text-gray-900">{{ sire.name }}</span>
                      <span v-if="sire.tag_number" class="text-xs text-gray-500">({{ sire.tag_number }})</span>
                    </button>
                  </div>
                  <div
                    v-if="showSireResults && !filteredSires.length && sireSearch"
                    class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white p-3 text-center text-sm text-gray-500 shadow-lg"
                  >
                    No matching sires found
                  </div>
                </div>
                <p v-if="formErrors.sire_id" class="mt-1 text-xs text-red-600">{{ formErrors.sire_id }}</p>

                <!-- Inbreeding warning (non-blocking) -->
                <div
                  v-if="inbreedingWarning"
                  :class="[
                    'mt-2 flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
                    inbreedingWarning.severity === 'high' ? 'border-red-200 bg-red-50 text-red-800' :
                    inbreedingWarning.severity === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-800' :
                    'border-yellow-200 bg-yellow-50 text-yellow-800'
                  ]"
                >
                  <AlertTriangle class="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span><span class="font-semibold">Inbreeding risk:</span> {{ inbreedingWarning.message }} You can still record this mating.</span>
                </div>
              </div>

              <!-- AI-specific fields -->
              <template v-if="breedingForm.sire_type === 'ai'">
                <div class="rounded-md border border-blue-100 bg-blue-50 p-4 space-y-3">
                  <p class="text-xs font-medium uppercase tracking-wider text-blue-600">AI Details</p>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <Label class="mb-1 block text-sm font-medium text-gray-700">Straw Code *</Label>
                      <Input v-model="breedingForm.ai_straw_code" type="text" class="w-full" placeholder="e.g. AB-2024-HF-0871" />
                      <p v-if="formErrors.ai_straw_code" class="mt-1 text-xs text-red-600">{{ formErrors.ai_straw_code }}</p>
                    </div>
                    <div>
                      <Label class="mb-1 block text-sm font-medium text-gray-700">Bull Name *</Label>
                      <Input v-model="breedingForm.ai_bull_name" type="text" class="w-full" placeholder="e.g. Valor HF Supreme" />
                      <p v-if="formErrors.ai_bull_name" class="mt-1 text-xs text-red-600">{{ formErrors.ai_bull_name }}</p>
                    </div>
                  </div>
                  <div>
                    <Label class="mb-1 block text-sm font-medium text-gray-700">AI Technician</Label>
                    <Input v-model="breedingForm.ai_technician" type="text" class="w-full" placeholder="e.g. Dr. James Mwangi" />
                    <p v-if="formErrors.ai_technician" class="mt-1 text-xs text-red-600">{{ formErrors.ai_technician }}</p>
                  </div>
                </div>
              </template>

              <!-- Service Date & Expected Birth -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Service Date *</Label>
                  <Input v-model="breedingForm.service_date" type="date" class="w-full" required />
                  <p v-if="formErrors.service_date" class="mt-1 text-xs text-red-600">{{ formErrors.service_date }}</p>
                </div>
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Expected Birth Date</Label>
                  <Input v-model="breedingForm.expected_birth_date" type="date" class="w-full" @input="markBirthDateEdited" />
                  <p v-if="expectedBirthHint" class="mt-1 text-xs text-gray-500">{{ expectedBirthHint }}</p>
                  <p v-if="formErrors.expected_birth_date" class="mt-1 text-xs text-red-600">{{ formErrors.expected_birth_date }}</p>
                </div>
              </div>

              <!-- Status -->
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Status</Label>
                <select
                  v-model="breedingForm.status"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="aborted">Aborted</option>
                  <option value="failed">Failed</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">A birth is recorded later with Register Birth, so the offspring get created with it.</p>
                <p v-if="formErrors.status" class="mt-1 text-xs text-red-600">{{ formErrors.status }}</p>
              </div>

              <!-- Notes -->
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Notes</Label>
                <textarea
                  v-model="breedingForm.notes"
                  rows="2"
                  placeholder="Observations, conditions, or additional details..."
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>

              <!-- Submit -->
              <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting">
                  <span v-if="submitting" class="flex items-center">
                    <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Saving...
                  </span>
                  <span v-else>Save Breeding</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Register Birth -->
    <AnimalBirthModal
      v-if="birthTarget"
      :key="birthTarget.uuid"
      :breeding="birthTarget"
      :animal-uuid="animalUuid"
      :dam-name="damName"
      @close="birthTarget = null"
      @saved="onBirthSaved"
    />
  </div>
</template>

<script lang="ts" setup>
import { Plus, X, CloudOff, AlertTriangle } from 'lucide-vue-next'

import { useAnimalBreedings, type BreedingRecord } from '~/composables/useAnimalBreedings'

const props = defineProps<{
  animalUuid: string
  trackingType: 'individual' | 'group'
  gestationDays?: number | null
  damName?: string | null
}>()

const {
  breedings,
  loading,
  loadError,
  submitting,
  showModal,
  formErrors,
  errorList,
  breedingForm,
  sireSearch,
  showSireResults,
  filteredSires,
  sireTypeLabel,
  statusLabel,
  openModal,
  closeModal,
  handleSireSearch,
  selectSire,
  fetchBreedings,
  saveBreeding,
  updateBreedingStatus,
  setGestationDays,
  markBirthDateEdited,
  expectedBirthHint,
  inbreedingWarning
} = useAnimalBreedings(props.animalUuid, props.trackingType)

// Feed the dam's gestation length in so the expected birth date pre-fills.
watch(() => props.gestationDays, days => setGestationDays(days), { immediate: true })

// ── Register Birth ────────────────────────────────────────────────────────
// A birth is never just a status change: it creates the offspring, logs a
// birth event and closes the reminder task, so it goes through its own modal
// and its own endpoint.
const birthTarget = ref<BreedingRecord | null>(null)

const openBirthModal = (record: BreedingRecord) => {
  birthTarget.value = record
}

const onBirthSaved = (updated: BreedingRecord, synced: boolean) => {
  const index = breedings.value.findIndex(b => b.uuid === updated.uuid)
  if (index !== -1) breedings.value[index] = { ...breedings.value[index], ...updated }
  birthTarget.value = null
  // Queued offline, the server copy isn't there yet — the optimistic row above
  // is all we have until the queue drains.
  if (synced) fetchBreedings()
}

// Aborted / failed still resolve through the plain status update.
const resolveWithoutBirth = (record: BreedingRecord, select: HTMLSelectElement) => {
  const status = select.value as 'aborted' | 'failed' | ''
  select.value = ''
  if (!status || !record.uuid) return
  updateBreedingStatus(record.uuid, status)
}

// "Time it might give birth" — a countdown from the expected date. Computed
// on the client so it stays right for offline records too, and only for
// pregnancies still pending (born/aborted/failed have already resolved).
const daysUntilBirth = (record: { expected_birth_date?: string | null }) => {
  if (!record.expected_birth_date) return null
  const target = new Date(`${record.expected_birth_date}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

const birthCountdownLabel = (record: { expected_birth_date?: string | null; status?: string }) => {
  if (record.status && record.status !== 'pending') return ''
  const days = daysUntilBirth(record)
  if (days === null) return ''
  if (days > 1) return `in ${days} days`
  if (days === 1) return 'tomorrow'
  if (days === 0) return 'due today'
  return `overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
}

const birthCountdownClass = (record: { expected_birth_date?: string | null; status?: string }) => {
  if (record.status && record.status !== 'pending') return 'text-gray-400'
  const days = daysUntilBirth(record)
  if (days === null) return 'text-gray-400'
  if (days < 0) return 'font-semibold text-red-600'
  if (days <= 7) return 'font-semibold text-amber-600'
  return 'text-gray-500'
}
</script>
