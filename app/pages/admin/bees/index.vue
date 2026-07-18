<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bee Keeping</h1>
        <p class="text-sm text-gray-500 mt-1">Your hives, harvests and what is ready today</p>
      </div>
      <div class="mt-3 sm:mt-0 flex gap-2">
        <button
          v-if="selectedApiary"
          class="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          @click="openProfileModal"
        >
          <Settings class="w-4 h-4 mr-2" />
          Naming
        </button>
        <button
          v-if="selectedApiary"
          class="inline-flex items-center px-4 py-2 bg-white border border-green-500 text-green-600 text-sm font-semibold rounded-lg hover:bg-green-50 transition-colors"
          @click="openHiveModal"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Hive
        </button>
        <button
          v-if="selectedApiary && apiaryHives.length"
          class="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
          @click="startHarvest"
        >
          <Scale class="w-4 h-4 mr-2" />
          Record Harvest
        </button>
      </div>
    </div>

    <!-- Offline note -->
    <div v-if="fromCache" class="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
      <WifiOff class="w-4 h-4 shrink-0" />
      You're offline — showing hives saved on this phone. New records will send when you have network.
    </div>

    <!-- Apiary picker -->
    <div v-if="apiaries.length" class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">Apiary</label>
      <select
        v-model="selectedApiaryUuid"
        class="w-full sm:w-80 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm"
      >
        <option v-for="apiary in apiaries" :key="apiary.uuid" :value="apiary.uuid">
          {{ apiary.name }}
        </option>
      </select>
    </div>

    <!-- Empty states -->
    <div v-if="!apiaries.length && !apiariesLoading" class="bg-white rounded-lg shadow p-10 text-center">
      <Hexagon class="w-10 h-10 text-amber-400 mx-auto mb-3" />
      <h2 class="text-lg font-semibold text-gray-900 mb-1">No apiary yet</h2>
      <p class="text-sm text-gray-500 mb-4">
        An apiary is a group of hives. Create a herd/group with animal type <strong>Bees</strong> first — your hives will live inside it.
      </p>
      <NuxtLink
        to="/admin/livestock/add"
        class="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        <Plus class="w-4 h-4 mr-2" />
        Create Apiary
      </NuxtLink>
    </div>

    <template v-if="selectedApiary">
      <!-- Harvest selection banner -->
      <div
        v-if="selecting"
        class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3"
      >
        <p class="text-sm font-medium text-green-800">
          Tap the hives you harvested — {{ selectedHiveUuids.length }} selected
        </p>
        <div class="flex gap-2">
          <button
            class="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="cancelHarvest"
          >
            Cancel
          </button>
          <button
            :disabled="!selectedHiveUuids.length"
            class="px-4 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
            @click="harvests.openModal()"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Hive grid -->
      <div v-if="hivesLoading" class="text-center py-10 text-gray-500 text-sm">Loading hives…</div>
      <div v-else-if="!apiaryHives.length" class="bg-white rounded-lg shadow p-10 text-center">
        <Hexagon class="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h2 class="text-lg font-semibold text-gray-900 mb-1">No hives in this apiary</h2>
        <p class="text-sm text-gray-500 mb-4">Add your first hive — it will be named <strong>{{ nextCodePreview || 'A' }}</strong> automatically.</p>
        <button
          class="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
          @click="openHiveModal"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Hive
        </button>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <button
          v-for="hive in apiaryHives"
          :key="hive.uuid"
          type="button"
          class="relative bg-white rounded-xl shadow p-4 text-left transition-all border-2"
          :class="selecting
            ? (isSelected(hive.uuid!) ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent hover:border-green-200')
            : 'border-transparent'"
          @click="selecting && hive.code ? toggleHive(hive.uuid!) : null"
        >
          <CheckCircle2
            v-if="selecting && isSelected(hive.uuid!)"
            class="absolute top-2 right-2 w-5 h-5 text-green-500"
          />
          <div class="flex items-center justify-between mb-2">
            <span class="text-2xl font-extrabold text-gray-900 tracking-wide">
              {{ hive.code ?? '…' }}
            </span>
            <Hexagon class="w-5 h-5" :class="hive.occupancy === 'occupied' ? 'text-amber-400' : 'text-gray-300'" />
          </div>
          <p v-if="hive.name" class="text-sm text-gray-600 truncate mb-1">{{ hive.name }}</p>
          <p v-if="!hive.code" class="text-xs text-amber-600 mb-1">Code pending — will be set when synced</p>
          <span
            class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
            :class="hiveResource.readiness(hive).classes"
          >
            {{ hiveResource.readiness(hive).label }}
          </span>
          <p v-if="hive.next_harvest_due" class="text-xs text-gray-400 mt-1">
            Next harvest: {{ hive.next_harvest_due }}
          </p>
          <p v-if="hive.sync_error" class="text-xs text-red-500 mt-1">{{ hive.sync_error }}</p>
        </button>
      </div>

      <!-- Harvest history -->
      <div class="mt-10">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Recent harvests</h2>
        <div v-if="!harvestSessions.length" class="text-sm text-gray-500">No harvests recorded yet.</div>
        <div v-else class="space-y-2">
          <div
            v-for="session in harvestSessions"
            :key="session.uuid"
            class="bg-white rounded-lg shadow px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ session.date }}</p>
              <p class="text-xs text-gray-500">
                {{ session.hive_count ?? session.hive_codes?.length ?? 0 }} hive(s)
                <template v-if="session.hive_codes?.length"> — {{ session.hive_codes.join(', ') }}</template>
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="total in session.totals"
                :key="total.product"
                class="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium"
              >
                {{ harvests.productLabel(total.product) }}: {{ total.quantity }} {{ total.unit }}
              </span>
              <span v-if="session.synced === false" class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                Saved on phone
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add hive modal -->
    <div v-if="hiveResource.showModal.value" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Add Hive</h2>
          <button class="text-gray-400 hover:text-gray-600" @click="hiveResource.closeModal()"><X class="w-5 h-5" /></button>
        </div>
        <p class="text-sm text-gray-500 mb-4">
          The hive will be named <strong>{{ nextCodePreview || 'automatically' }}</strong> for you.
        </p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hive type</label>
            <select v-model="hiveResource.hiveForm.value.hive_type" class="w-full rounded-lg border-gray-300 text-sm">
              <option v-for="type in HIVE_TYPES" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date installed</label>
            <input v-model="hiveResource.hiveForm.value.installed_date" type="date" class="w-full rounded-lg border-gray-300 text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nickname (optional)</label>
            <input v-model="hiveResource.hiveForm.value.name" type="text" placeholder="e.g. By the mango tree" class="w-full rounded-lg border-gray-300 text-sm">
          </div>
          <p v-if="hiveResource.submitError.value" class="text-sm text-red-500">{{ hiveResource.submitError.value }}</p>
          <ul v-if="hiveResource.errorList.value.length" class="text-sm text-red-500 list-disc pl-5">
            <li v-for="error in hiveResource.errorList.value" :key="error">{{ error }}</li>
          </ul>
          <button
            :disabled="hiveResource.submitting.value"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50"
            @click="submitHive"
          >
            {{ hiveResource.submitting.value ? 'Saving…' : 'Save Hive' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Harvest modal -->
    <div v-if="harvests.showModal.value" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div class="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-lg font-semibold text-gray-900">Record Harvest</h2>
          <button class="text-gray-400 hover:text-gray-600" @click="harvests.closeModal()"><X class="w-5 h-5" /></button>
        </div>
        <p class="text-sm text-gray-500 mb-4">
          {{ selectedHiveUuids.length }} hive(s): {{ selectedCodes.join(', ') }}
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Harvest date</label>
            <input v-model="harvests.harvestDate.value" type="date" class="w-full rounded-lg border-gray-300 text-sm">
          </div>

          <div
            v-for="(line, index) in harvests.lines.value"
            :key="index"
            class="rounded-lg border border-gray-200 p-3 space-y-3"
          >
            <div class="flex items-center gap-2">
              <select
                v-model="line.product"
                class="flex-1 rounded-lg border-gray-300 text-sm"
                @change="harvests.onProductChange(line)"
              >
                <option v-for="product in BEE_PRODUCTS" :key="product.value" :value="product.value">
                  {{ product.label }}
                </option>
              </select>
              <button
                v-if="harvests.lines.value.length > 1"
                class="text-gray-400 hover:text-red-500"
                @click="harvests.removeLine(index)"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="flex rounded-lg bg-gray-100 p-1 text-xs font-medium">
              <button
                class="flex-1 py-1.5 rounded-md"
                :class="line.mode === 'even' ? 'bg-white shadow text-gray-900' : 'text-gray-500'"
                @click="line.mode = 'even'"
              >
                One total (split evenly)
              </button>
              <button
                class="flex-1 py-1.5 rounded-md"
                :class="line.mode === 'per_hive' ? 'bg-white shadow text-gray-900' : 'text-gray-500'"
                @click="line.mode = 'per_hive'"
              >
                Per hive
              </button>
            </div>

            <div v-if="line.mode === 'even'">
              <label class="block text-sm text-gray-600 mb-1">Total quantity ({{ line.unit }})</label>
              <input
                v-model.number="line.total"
                type="number" inputmode="decimal" min="0" step="0.01"
                class="w-full rounded-lg border-gray-300 text-sm"
                :placeholder="`e.g. 12.5 ${line.unit}`"
              >
            </div>
            <div v-else class="space-y-2">
              <div v-for="hive in selectedHives" :key="hive.uuid" class="flex items-center gap-3">
                <span class="w-16 font-bold text-gray-900">{{ hive.code }}</span>
                <input
                  v-model.number="line.perHive[hive.uuid!]"
                  type="number" inputmode="decimal" min="0" step="0.01"
                  class="flex-1 rounded-lg border-gray-300 text-sm"
                  :placeholder="line.unit"
                >
              </div>
            </div>
          </div>

          <button class="text-sm font-medium text-green-600 hover:text-green-700" @click="harvests.addLine()">
            + Add another product (wax, propolis…)
          </button>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea v-model="harvests.harvestNotes.value" rows="2" class="w-full rounded-lg border-gray-300 text-sm" />
          </div>

          <p v-if="harvests.submitError.value" class="text-sm text-red-500">{{ harvests.submitError.value }}</p>
          <ul v-if="harvests.errorList.value.length" class="text-sm text-red-500 list-disc pl-5">
            <li v-for="error in harvests.errorList.value" :key="error">{{ error }}</li>
          </ul>

          <button
            :disabled="harvests.submitting.value"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50"
            @click="submitHarvest"
          >
            {{ harvests.submitting.value ? 'Saving…' : 'Save Harvest' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Naming / settings modal (online-only, like other settings screens) -->
    <div v-if="showProfileModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Hive Naming & Harvest Settings</h2>
          <button class="text-gray-400 hover:text-gray-600" @click="showProfileModal = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prefix letters (optional)</label>
            <input v-model="profileForm.naming_prefix" type="text" maxlength="10" placeholder="e.g. KB → KB-A, KB-B…" class="w-full rounded-lg border-gray-300 text-sm uppercase">
          </div>
          <div v-if="!apiaryHives.length">
            <label class="block text-sm font-medium text-gray-700 mb-1">Start at letter (optional)</label>
            <input v-model="profileForm.start_letter" type="text" maxlength="1" placeholder="e.g. H" class="w-full rounded-lg border-gray-300 text-sm uppercase">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Days between honey harvests</label>
            <input v-model.number="profileForm.default_harvest_interval_days" type="number" min="7" max="365" class="w-full rounded-lg border-gray-300 text-sm">
          </div>
          <p class="text-xs text-gray-500">
            New hives will be named: <strong>{{ profilePreview }}</strong>. Existing hive codes never change.
          </p>
          <p v-if="profileError" class="text-sm text-red-500">{{ profileError }}</p>
          <button
            :disabled="profileSaving"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50"
            @click="saveProfile"
          >
            {{ profileSaving ? 'Saving…' : 'Save Settings' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, Hexagon, Plus, Scale, Settings, WifiOff, X } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

const { $apiFetch } = useNuxtApp()
const { getReference } = useReferenceData()

const hiveResource = useHives()
const harvests = useBeeHarvests()

const { fromCache } = hiveResource
const hivesLoading = hiveResource.loading
const harvestSessions = harvests.sessions

// ── Apiaries (animal groups of type Bees) ────────────────────────────────
interface ApiaryOption { uuid: string, name: string, animal_type?: string | null }

const apiaries = ref<ApiaryOption[]>([])
const apiariesLoading = ref(true)
const selectedApiaryUuid = ref<string>('')

const selectedApiary = computed(() =>
  apiaries.value.find(a => a.uuid === selectedApiaryUuid.value) ?? null)

const fetchApiaries = async () => {
  apiariesLoading.value = true
  try {
    const { data } = await getReference<ApiaryOption>('animal_groups')
    const bees = data.filter(g => (g.animal_type ?? '').toLowerCase().includes('bee'))
    apiaries.value = bees.length ? bees : data
    if (!selectedApiaryUuid.value && apiaries.value.length) {
      selectedApiaryUuid.value = apiaries.value[0]!.uuid
    }
  } catch (err) {
    console.error('Failed to load apiaries:', err)
  } finally {
    apiariesLoading.value = false
  }
}

const apiaryHives = computed(() =>
  selectedApiaryUuid.value ? hiveResource.hivesForApiary(selectedApiaryUuid.value) : [])

// ── Add hive ─────────────────────────────────────────────────────────────
const openHiveModal = () => {
  fetchProfile() // refresh the next-code preview
  hiveResource.openModal()
}

const submitHive = async () => {
  if (!selectedApiary.value) return
  const saved = await hiveResource.saveHive(selectedApiary.value.uuid, selectedApiary.value.name)
  if (saved) fetchProfile()
}

// ── Harvest selection flow ───────────────────────────────────────────────
const selecting = ref(false)
const selectedHiveUuids = ref<string[]>([])

const selectedHives = computed(() =>
  apiaryHives.value.filter(h => h.uuid && selectedHiveUuids.value.includes(h.uuid)))
const selectedCodes = computed(() =>
  selectedHives.value.map(h => h.code ?? '?'))

const isSelected = (uuid: string) => selectedHiveUuids.value.includes(uuid)

const toggleHive = (uuid: string) => {
  selectedHiveUuids.value = isSelected(uuid)
    ? selectedHiveUuids.value.filter(u => u !== uuid)
    : [...selectedHiveUuids.value, uuid]
}

const startHarvest = () => {
  selecting.value = true
  // Pre-select every hive that is ready — the common case.
  selectedHiveUuids.value = apiaryHives.value
    .filter(h => h.uuid && h.code && h.harvest_status === 'ready')
    .map(h => h.uuid!)
}

const cancelHarvest = () => {
  selecting.value = false
  selectedHiveUuids.value = []
}

const submitHarvest = async () => {
  const saved = await harvests.saveHarvest(selectedHiveUuids.value, selectedCodes.value)
  if (saved) {
    cancelHarvest()
    await Promise.all([hiveResource.fetchHives(), harvests.fetchSessions()])
  }
}

// ── Apiary profile (naming convention + interval) ────────────────────────
const showProfileModal = ref(false)
const profileSaving = ref(false)
const profileError = ref<string | null>(null)
const nextCodePreview = ref('')
const profileForm = ref({
  naming_prefix: '',
  start_letter: '',
  default_harvest_interval_days: 90
})

const profilePreview = computed(() => {
  const prefix = profileForm.value.naming_prefix.trim().toUpperCase()
  const letter = (profileForm.value.start_letter.trim().toUpperCase() || 'A')
  const first = apiaryHives.value.length ? (nextCodePreview.value || 'next code') : letter
  return prefix && !first.startsWith(`${prefix}-`) ? `${prefix}-${first}` : first
})

const fetchProfile = async () => {
  if (!selectedApiary.value) return
  try {
    const response = await $apiFetch<any>(`/api/v1/farms/farm/bees/apiaries/${selectedApiary.value.uuid}/profile`)
    const data = response?.data ?? response
    nextCodePreview.value = data?.next_code_preview ?? ''
    profileForm.value.naming_prefix = data?.naming_prefix ?? ''
    profileForm.value.default_harvest_interval_days = data?.default_harvest_interval_days ?? 90
  } catch (err) {
    console.error('Failed to load apiary profile:', err)
  }
}

const openProfileModal = () => {
  profileError.value = null
  fetchProfile()
  showProfileModal.value = true
}

const saveProfile = async () => {
  if (!selectedApiary.value) return
  profileSaving.value = true
  profileError.value = null
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<any>(`/api/v1/farms/farm/bees/apiaries/${selectedApiary.value.uuid}/profile`, {
      method: 'POST',
      body: {
        naming_prefix: profileForm.value.naming_prefix.trim().toUpperCase() || null,
        start_letter: profileForm.value.start_letter.trim().toUpperCase() || null,
        default_harvest_interval_days: profileForm.value.default_harvest_interval_days || 90
      }
    })
    nextCodePreview.value = (response?.data ?? response)?.next_code_preview ?? nextCodePreview.value
    showProfileModal.value = false
  } catch (err: any) {
    profileError.value = err?.data?.message ?? 'Could not save settings (are you online?)'
  } finally {
    profileSaving.value = false
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────
watch(selectedApiaryUuid, () => {
  cancelHarvest()
  fetchProfile()
})

onMounted(async () => {
  await fetchApiaries()
  hiveResource.fetchHives()
  harvests.fetchSessions()
  fetchProfile()
})
</script>
