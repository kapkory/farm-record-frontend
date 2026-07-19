<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-gray-900">Production</h3>
          <p class="mt-0.5 text-sm text-gray-500">Record everything collected — milk, eggs and more — whether or not it is sold.</p>
        </div>
        <Button type="button" @click="openModal" class="inline-flex items-center gap-2">
          <Plus class="h-4 w-4" />
          Record Collection
        </Button>
      </div>

      <!-- This week at a glance -->
      <div v-if="weekTotals.length" class="flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50 px-6 py-3">
        <div v-for="total in weekTotals" :key="total.name" class="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-sm">
          <span class="text-gray-500">{{ total.name }} this week:</span>
          <span class="ml-1 font-semibold text-gray-900">{{ total.quantity }} {{ total.unit }}</span>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <span class="ml-3 text-gray-600">Loading production records...</span>
      </div>

      <div v-else-if="loadError" class="rounded-b-lg bg-red-50 px-6 py-5 text-red-700">
        <p class="font-medium">Failed to load production records</p>
        <p class="mt-1 text-sm">{{ loadError }}</p>
        <button @click="fetchProductions" class="mt-2 text-sm underline hover:no-underline">Try again</button>
      </div>

      <div v-else-if="!productions.length" class="px-6 py-12 text-center text-gray-500">
        <p class="font-medium text-gray-700">Nothing recorded yet.</p>
        <p class="mt-1 text-sm">Record the first collection — for example this morning's milk.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Grade</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="production in productions" :key="production.uuid" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {{ production.date }}
                <span v-if="production.synced === false" class="ml-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">will sync</span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ production.name }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">{{ production.quantity }} {{ production.unit }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ production.grade || '—' }}</td>
              <td class="max-w-xs truncate px-6 py-4 text-sm text-gray-500">{{ production.notes || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-md rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Record Collection</h3>
                <p class="mt-1 text-sm text-gray-500">What was collected and how much?</p>
              </div>
              <button type="button" @click="closeModal" class="text-gray-400 transition-colors hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="saveProduction" class="space-y-4 p-5">
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Product</Label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="product in products"
                    :key="product.value"
                    type="button"
                    @click="selectProduct(product.value); if (product.value !== 'Other') otherProduct = ''"
                    :class="['rounded-full border px-3 py-1.5 text-sm font-medium transition-colors', isChipActive(product.value) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-600 hover:border-green-300']"
                  >
                    {{ product.value }}
                  </button>
                </div>
                <Input v-if="isCustomProduct" v-model="otherProduct" type="text" class="mt-2 w-full" placeholder="Name the product" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Quantity</Label>
                  <Input v-model="form.quantity" type="number" step="0.01" min="0.01" class="w-full" placeholder="e.g. 12.5" />
                </div>
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Unit</Label>
                  <Input v-model="form.unit" type="text" class="w-full" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Date</Label>
                  <Input v-model="form.date" type="date" class="w-full" />
                </div>
                <div>
                  <Label class="mb-1 block text-sm font-medium text-gray-700">Grade <span class="font-normal text-gray-400">(optional)</span></Label>
                  <Input v-model="form.grade" type="text" class="w-full" placeholder="e.g. Grade A" />
                </div>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Notes <span class="font-normal text-gray-400">(optional)</span></Label>
                <textarea v-model="form.notes" rows="2" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Morning milking"></textarea>
              </div>

              <div v-if="submitError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p class="font-medium">{{ submitError }}</p>
                <ul v-if="errorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in errorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" @click="closeModal" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="submitting || !Number(form.quantity)">
                  <span v-if="submitting">Saving...</span>
                  <span v-else>Save Collection</span>
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
import { ANIMAL_PRODUCTS } from '../../composables/useAnimalProductions'

const props = defineProps<{ animalUuid: string; trackingType?: 'individual' | 'group' }>()

const products = ANIMAL_PRODUCTS

const {
  productions,
  loading,
  loadError,
  submitting,
  submitError,
  errorList,
  showModal,
  form,
  weekTotals,
  selectProduct,
  openModal,
  closeModal,
  fetchProductions,
  saveProduction
} = useAnimalProductions(props.animalUuid, props.trackingType ?? 'individual')

// "Other" lets the farmer type a free product name that replaces the preset.
const otherProduct = ref('')

const isCustomProduct = computed(() =>
  form.value.name === 'Other' || !products.some(p => p.value === form.value.name)
)

const isChipActive = (value: string) =>
  value === 'Other' ? isCustomProduct.value : form.value.name === value

watch(otherProduct, (value) => {
  if (isCustomProduct.value) form.value.name = value || 'Other'
})
</script>
