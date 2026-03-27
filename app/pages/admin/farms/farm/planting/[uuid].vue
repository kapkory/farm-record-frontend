<template>
  <div class="space-y-6">
    <div>
      <button @click="router.back()" class="inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900">
        <ChevronLeft class="w-4 h-4" />
        Back
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading planting...</span>
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
      <p class="font-medium">Failed to load planting</p>
      <p class="mt-1 text-sm">{{ error }}</p>
      <button @click="fetchPlanting" class="mt-3 text-sm underline hover:no-underline">Try again</button>
    </div>

    <template v-else-if="planting">
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
              <Sprout class="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ planting.crop?.name ?? 'Unknown Crop' }}</h1>
              <p class="mt-0.5 text-sm text-gray-500">{{ planting.crop_variety?.name ?? 'No variety specified' }}</p>
              <div class="mt-1.5 flex items-center gap-2">
                <span :class="[
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  planting.actual_harvest_date ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                ]">
                  {{ planting.actual_harvest_date ? 'Harvested' : 'Growing' }}
                </span>
                <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize text-gray-700">
                  {{ planting.purpose ?? '—' }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Pencil class="h-4 w-4" />
              Edit
            </button>
            <button class="inline-flex items-center gap-2 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">
              <Trash2 class="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 border-t border-gray-100 bg-gray-50 md:grid-cols-4">
          <div class="border-b border-gray-100 px-5 py-3 md:border-r">
            <p class="text-xs uppercase tracking-wide text-gray-500">Farm</p>
            <p class="mt-0.5 truncate text-sm font-semibold text-gray-900">{{ planting.farm?.name ?? '—' }}</p>
          </div>
          <div class="border-b border-gray-100 px-5 py-3 md:border-r">
            <p class="text-xs uppercase tracking-wide text-gray-500">Field</p>
            <p class="mt-0.5 truncate text-sm font-semibold text-gray-900">{{ planting.field?.name ?? '—' }}</p>
            <p v-if="planting.field?.size" class="text-xs text-gray-400">{{ planting.field.size }}</p>
          </div>
          <div class="border-b border-gray-100 px-5 py-3 md:border-r">
            <p class="text-xs uppercase tracking-wide text-gray-500">Qty Planted</p>
            <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ planting.quantity_planted ?? '—' }}</p>
          </div>
          <div class="border-b border-gray-100 px-5 py-3">
            <p class="text-xs uppercase tracking-wide text-gray-500">Total Recorded</p>
            <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ formatCurrency(totalRecordedAmount) }}</p>
          </div>
          <div class="border-b border-gray-100 px-5 py-3 md:border-r md:border-b-0">
            <p class="text-xs uppercase tracking-wide text-gray-500">Date Planted</p>
            <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ planting.date_planted }}</p>
          </div>
          <div class="border-b border-gray-100 px-5 py-3 md:border-r md:border-b-0">
            <p class="text-xs uppercase tracking-wide text-gray-500">Expected Harvest</p>
            <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ planting.expected_harvest_date ?? '—' }}</p>
          </div>
          <div class="border-b border-gray-100 px-5 py-3 md:border-r md:border-b-0">
            <p class="text-xs uppercase tracking-wide text-gray-500">Actual Harvest</p>
            <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ planting.actual_harvest_date ?? 'Not yet harvested' }}</p>
          </div>
          <div class="border-b border-gray-100 px-5 py-3 md:border-b-0">
            <p class="text-xs uppercase tracking-wide text-gray-500">Purpose</p>
            <p class="mt-0.5 text-sm font-semibold capitalize text-gray-900">{{ planting.purpose ?? '—' }}</p>
          </div>
          <div class="col-span-2 px-5 py-3 md:col-span-4">
            <p class="text-xs uppercase tracking-wide text-gray-500">Notes / Description</p>
            <p class="mt-0.5 whitespace-pre-line text-sm text-gray-700">{{ planting.description ?? 'No additional notes recorded.' }}</p>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tab in plantingTabs"
              :key="tab.value"
              type="button"
              @click="handleTabChange(tab.value)"
              :class="[
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.value
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'overview'">
        <div class="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Ledger Transactions</h2>
            <p class="mt-0.5 text-sm text-gray-500">Record money in, money out, assets, liabilities, and owner investment for this planting.</p>
          </div>
          <button @click="openLedgerModal" class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Plus class="h-4 w-4" />
            Record Transaction
          </button>
        </div>

        <div class="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div class="min-w-0 border-b border-gray-200 xl:border-b-0 xl:border-r xl:border-gray-200">
            <div class="grid grid-cols-2 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-4 md:grid-cols-5">
              <div v-for="type in ledgerTypeOptions" :key="type.value" class="rounded-lg border border-white/60 bg-white px-3 py-2">
                <p class="text-xs uppercase tracking-wide text-gray-500">{{ type.label }}</p>
                <p class="mt-1 text-sm font-semibold text-gray-900">{{ ledgerTypeCount(type.value) }} entries</p>
                <p class="text-xs" :class="type.textClass">{{ formatCurrency(ledgerTypeTotal(type.value)) }}</p>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Account</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Payment</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Qty</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Unit Cost</th>
                    <th class="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Receipt No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="transaction in ledgerTransactions" :key="transaction.id" class="hover:bg-gray-50">
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ transaction.date }}</td>
                    <td class="whitespace-nowrap px-6 py-4">
                      <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold', ledgerTypeConfig(transaction.type).pillClass]">
                        <span>{{ ledgerTypeConfig(transaction.type).emoji }}</span>
                        {{ ledgerTypeConfig(transaction.type).label }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ transaction.account_name }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-500">{{ transaction.payment_method ?? '—' }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ transaction.quantity ?? '—' }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ transaction.unit_cost ? formatCurrency(transaction.unit_cost) : '—' }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">{{ formatCurrency(transaction.amount) }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ transaction.reference_number ?? '—' }}</td>
                    <td class="max-w-xs px-6 py-4 text-sm text-gray-500">{{ transaction.notes ?? '—' }}</td>
                  </tr>
                  <tr v-if="!ledgerTransactions.length">
                    <td colspan="9" class="px-6 py-10 text-center text-sm text-gray-500">
                      No ledger transactions recorded yet.
                      <button @click="openLedgerModal" class="ml-1 text-green-600 underline hover:no-underline">Record the first transaction.</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="border-t border-gray-200 bg-gray-50 px-6 py-5">
              <div class="rounded-lg border border-gray-200 bg-white px-4 py-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-medium text-gray-700">Recovery progress</p>
                  <p class="text-sm font-semibold text-gray-900">{{ recoveryRateLabel }}</p>
                </div>
                <div class="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                  <div class="h-full rounded-full bg-green-500 transition-all" :style="{ width: recoveryProgressWidth }"></div>
                </div>
                <p class="mt-3 text-sm text-gray-600">{{ breakEvenMessage }}</p>
              </div>
            </div>
          </div>

          <aside class="bg-gray-50 p-6">
            <div class="space-y-4">
  
              <div class="rounded-lg border border-green-100 bg-green-50 px-4 py-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-green-700">Money In</p>
                <p class="mt-1 text-2xl font-bold text-gray-900">{{ formatCurrency(moneyInTotal) }}</p>
                <p class="mt-1 text-sm text-green-800">Sales and other income recorded for this planting.</p>
              </div>

              <div class="rounded-lg border border-red-100 bg-red-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-red-700">Money Out</p>
                <p class="mt-1 text-2xl font-bold text-gray-900">{{ formatCurrency(moneyOutTotal) }}</p>
                <p class="mt-1 text-sm text-red-800">Seeds, labour, chemicals, transport, and other costs recorded.</p>
              </div>

              <div :class="['rounded-lg border px-4 py-4', netResultCardClass]">
                <p class="text-xs font-semibold uppercase tracking-wide" :class="profitabilityAccentClass">Net Result</p>
                <p class="mt-1 text-2xl font-bold text-gray-900">{{ formatCurrency(Math.abs(netProfit)) }}</p>
                <p class="mt-1 text-sm text-gray-700">{{ netResultDescription }}</p>
              </div>

              <div class="rounded-lg border border-gray-200 bg-white px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-600">Cost Recovery</p>
                <p class="mt-1 text-2xl font-bold text-gray-900">{{ recoveryRateLabel }}</p>
                <p class="mt-1 text-sm text-gray-600">{{ recoveryMessage }}</p>
              </div>

              <div class="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                This summary only uses <span class="font-semibold">Money In</span> and <span class="font-semibold">Money Out</span> to show profit. Assets, loans, and owner capital are still recorded here, but they are not counted as profit.
              </div>
            </div>
          </aside>
        </div>

        </div>

        <div v-else-if="activeTab === 'treatments'" class="p-6">
          <Treatment :farm-id="planting.farm?.uuid ?? ''" :planting-uuid="planting.uuid" />
        </div>

        <div v-else-if="activeTab === 'tasks'" class="p-6">
          <Task :planting-uuid="planting.uuid" />
        </div>

        <div v-else class="p-6">
          <Harvest :crop-name="planting.crop?.name ?? 'Harvest'" :planting-uuid="planting.uuid" />
        </div>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="showAddLedgerModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeLedgerModal"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Create New Transaction</h3>
              </div>
              <button @click="closeLedgerModal" class="text-gray-400 hover:text-gray-600">
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="submitLedgerTransaction" class="space-y-5 p-4">
              <div>
                <Label class="mb-2 block text-sm font-medium text-gray-700">Account Type</Label>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <button
                    v-for="type in ledgerTypeOptions"
                    :key="type.value"
                    type="button"
                    @click="selectLedgerType(type.value)"
                    :class="[
                      'rounded-lg border px-4 py-3 text-left transition-colors',
                      ledgerForm.type === type.value ? type.selectedClass : 'border-gray-200 bg-white hover:border-gray-300'
                    ]"
                  >
                    <div class="text-2xl">{{ type.emoji }}</div>
                    <p class="mt-2 text-sm font-semibold text-gray-900">{{ type.farmerText }}</p>
                    <p class="mt-1 text-xs text-gray-500">{{ type.label }}</p>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label for="ledger_account_search" class="mb-1 block text-sm font-medium text-gray-700">Ledger Account</Label>
                  <div class="relative">
                    <Input
                      id="ledger_account_search"
                      v-model="ledgerAccountSearch"
                      type="text"
                      autocomplete="off"
                      :placeholder="`Search ${ledgerTypeConfig(ledgerForm.type).label.toLowerCase()} account`"
                      class="w-full"
                      @focus="showLedgerAccountResults = true"
                      @input="handleLedgerAccountSearch"
                    />
                    <div
                      v-if="showLedgerAccountResults"
                      class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                    >
                      <button
                        v-for="account in searchedLedgerAccounts"
                        :key="account.id"
                        type="button"
                        class="block w-full border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                        @click="selectLedgerAccount(account)"
                      >
                        <span class="block text-sm font-medium text-gray-900">{{ account.name }}</span>
                        <span v-if="account.description" class="block text-xs text-gray-500">{{ account.description }}</span>
                      </button>
                      <div v-if="!searchedLedgerAccounts.length" class="px-3 py-2 text-sm text-gray-500">
                        No matching ledger accounts found.
                      </div>
                    </div>
                  </div>
                  <p v-if="ledgerFormErrors.ledger_account_id" class="mt-1 text-xs text-red-600">{{ ledgerFormErrors.ledger_account_id }}</p>
                  <p v-if="selectedLedgerAccount?.description" class="mt-1 text-xs text-gray-500">{{ selectedLedgerAccount.description }}</p>
                </div>

                <div>
                  <Label for="txn_date" class="mb-1 block text-sm font-medium text-gray-700">Date</Label>
                  <Input id="txn_date" v-model="ledgerForm.date" type="date" required class="w-full" />
                  <p v-if="ledgerFormErrors.date" class="mt-1 text-xs text-red-600">{{ ledgerFormErrors.date }}</p>
                </div>

                <div>
                  <Label for="txn_amount" class="mb-1 block text-sm font-medium text-gray-700">Amount</Label>
                  <Input id="txn_amount" v-model="ledgerForm.amount" type="number" min="0" step="0.01" placeholder="0.00" required class="w-full" />
                  <p v-if="ledgerFormErrors.amount" class="mt-1 text-xs text-red-600">{{ ledgerFormErrors.amount }}</p>
                </div>

                <div>
                  <Label for="txn_quantity" class="mb-1 block text-sm font-medium text-gray-700">Quantity</Label>
                  <Input id="txn_quantity" v-model="ledgerForm.quantity" type="number" min="0" step="0.01" placeholder="Optional" class="w-full" />
                  <p class="mt-1 text-xs text-gray-500">Unit cost is {{ computedUnitCostDisplay }} calculated automatically from amount and quantity.</p>
                  <p v-if="ledgerFormErrors.quantity" class="mt-1 text-xs text-red-600">{{ ledgerFormErrors.quantity }}</p>
                </div>

                <!-- <div>
                  <Label for="txn_unit_cost" class="mb-1 block text-sm font-medium text-gray-700">Unit Cost</Label>
                  <Input id="txn_unit_cost" :model-value="computedUnitCostDisplay" type="text" readonly class="w-full bg-gray-50" />
                </div> -->

                <div>
                  <Label for="txn_payment_method" class="mb-1 block text-sm font-medium text-gray-700">Payment Method</Label>
                  <select id="txn_payment_method" v-model="ledgerForm.payment_method" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit">Credit</option>
                    <option value="other">Other</option>
                  </select>
                  <p v-if="ledgerFormErrors.payment_method" class="mt-1 text-xs text-red-600">{{ ledgerFormErrors.payment_method }}</p>
                </div>

                <div>
                  <Label for="txn_reference" class="mb-1 block text-sm font-medium text-gray-700">Receipt No.</Label>
                  <Input id="txn_reference" v-model="ledgerForm.reference_number" type="text" placeholder="Optional receipt / reference number" class="w-full" />
                  <p v-if="ledgerFormErrors.reference_number" class="mt-1 text-xs text-red-600">{{ ledgerFormErrors.reference_number }}</p>
                </div>
              </div>

              <div>
                <Label for="txn_notes" class="mb-1 block text-sm font-medium text-gray-700">Notes</Label>
                <textarea id="txn_notes" v-model="ledgerForm.notes" rows="3" placeholder="What happened in simple words" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
                <p v-if="ledgerFormErrors.description" class="mt-1 text-xs text-red-600">{{ ledgerFormErrors.description }}</p>
              </div>

              <input type="hidden" :value="ledgerForm.transaction_for" name="transaction_for" />
              <input type="hidden" :value="ledgerForm.transaction_uuid" name="transaction_uuid" />
              <input type="hidden" :value="ledgerForm.type" name="ledger_type" />

              <div v-if="ledgerSubmitError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <p class="font-medium">Please fix the following before saving:</p>
                <p class="mt-1">{{ ledgerSubmitError }}</p>
                <ul v-if="ledgerErrorList.length" class="mt-2 list-disc pl-5">
                  <li v-for="item in ledgerErrorList" :key="item">{{ item }}</li>
                </ul>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button type="button" @click="closeLedgerModal" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <Button type="submit" :disabled="ledgerSubmitting || !filteredLedgerAccounts.length">
                  <span v-if="ledgerSubmitting">Saving...</span>
                  <span v-else>Save Transaction</span>
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
import { ChevronLeft, Sprout, Pencil, Trash2, Plus, X } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

interface Planting {
  uuid: string
  farm: { uuid: string; name: string } | null
  field: { name: string; size: string } | null
  crop: { name: string } | null
  crop_variety: { name: string } | null
  date_planted: string
  expected_harvest_date: string | null
  actual_harvest_date: string | null
  quantity_planted: number | null
  purpose: string | null
  description: string | null
}

type PlantingTab = 'overview' | 'treatments' | 'tasks' | 'harvests'

type LedgerType = 'revenue' | 'expense' | 'asset' | 'liability' | 'equity'

interface LedgerAccount {
  id: number
  uuid?: string
  name: string
  type: LedgerType
  description: string | null
  is_system: boolean
  parent_id: number | null
}

interface LedgerTransactionRow {
  id: number | string
  date: string
  type: LedgerType
  account_name: string
  amount: number
  quantity: number | null
  unit_cost: number | null
  payment_method: string | null
  notes: string | null
  reference_number: string | null
}

interface LedgerTransactionListEntry {
  amount?: number | string | null
  quantity?: number | string | null
  unit_cost?: number | string | null
  ledger_account_id?: number | string | null
  ledgerAccount?: { name?: string | null; type?: LedgerType | null } | null
  ledger_account?: { name?: string | null; type?: LedgerType | null } | null
}

interface LedgerTransactionListItem {
  id?: number | string
  uuid?: string
  date?: string | null
  payment_method?: string | null
  description?: string | null
  reference_number?: string | null
  transaction_for?: string | null
  transaction_uuid?: string | null
  ledger_entries?: LedgerTransactionListEntry[] | null
  entries?: LedgerTransactionListEntry[] | null
}

type LedgerFormErrorKey =
  | 'ledger_account_id'
  | 'date'
  | 'amount'
  | 'quantity'
  | 'payment_method'
  | 'reference_number'
  | 'description'

type LedgerValidationErrors = Partial<Record<LedgerFormErrorKey, string>>

const { $apiFetch } = useNuxtApp()
const { isOnline } = useOffline()
const route = useRoute()
const router = useRouter()

const plantingUuid = computed(() => route.params.uuid as string)

const ledgerTypeOptions = [
  {
    value: 'revenue' as const,
    label: 'Revenue',
    farmerText: 'Money came in',
    emoji: '💰',
    selectedClass: 'border-green-500 bg-green-50',
    pillClass: 'bg-green-100 text-green-800',
    textClass: 'text-green-700'
  },
  {
    value: 'expense' as const,
    label: 'Expense',
    farmerText: 'Money went out',
    emoji: '🛒',
    selectedClass: 'border-red-500 bg-red-50',
    pillClass: 'bg-red-100 text-red-800',
    textClass: 'text-red-700'
  },
  {
    value: 'asset' as const,
    label: 'Asset',
    farmerText: 'I own something',
    emoji: '🚜',
    selectedClass: 'border-blue-500 bg-blue-50',
    pillClass: 'bg-blue-100 text-blue-800',
    textClass: 'text-blue-700'
  },
  {
    value: 'liability' as const,
    label: 'Liability',
    farmerText: 'I owe someone',
    emoji: '🏦',
    selectedClass: 'border-amber-500 bg-amber-50',
    pillClass: 'bg-amber-100 text-amber-800',
    textClass: 'text-amber-700'
  },
  {
    value: 'equity' as const,
    label: 'Equity',
    farmerText: 'Farm capital / owner investment',
    emoji: '🌾',
    selectedClass: 'border-purple-500 bg-purple-50',
    pillClass: 'bg-purple-100 text-purple-800',
    textClass: 'text-purple-700'
  }
]

const ledgerTypeConfig = (type: LedgerType) => {
  const config = ledgerTypeOptions.find((option) => option.value === type)
  return config ?? ledgerTypeOptions[1]!
}

const planting = ref<Planting | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<PlantingTab>('overview')
const showAddLedgerModal = ref(false)
const ledgerSubmitting = ref(false)
const ledgerSubmitError = ref<string | null>(null)
const ledgerFormErrors = ref<LedgerValidationErrors>({})
const ledgerErrorList = ref<string[]>([])
const ledgerAccounts = ref<LedgerAccount[]>([])
const ledgerTransactions = ref<LedgerTransactionRow[]>([])
const ledgerAccountSearch = ref('')
const showLedgerAccountResults = ref(false)

const plantingTabs: Array<{ value: PlantingTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'treatments', label: 'Treatments' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'harvests', label: 'Harvests' }
]

const defaultLedgerForm = () => ({
  type: 'expense' as LedgerType,
  ledger_account_id: '',
  date: new Date().toISOString().split('T')[0] ?? '',
  amount: '',
  quantity: '',
  payment_method: '',
  notes: '',
  reference_number: '',
  transaction_for: 'planting',
  transaction_uuid: planting.value?.uuid ?? plantingUuid.value,
})

const ledgerForm = ref(defaultLedgerForm())

const filteredLedgerAccounts = computed(() =>
  ledgerAccounts.value.filter((account) => account.type === ledgerForm.value.type)
)

const searchedLedgerAccounts = computed(() => {
  const query = ledgerAccountSearch.value.trim().toLowerCase()

  if (!query) return filteredLedgerAccounts.value

  return filteredLedgerAccounts.value.filter((account) => {
    const name = account.name.toLowerCase()
    const description = account.description?.toLowerCase() ?? ''
    return name.includes(query) || description.includes(query)
  })
})

const selectedLedgerAccount = computed(() =>
  ledgerAccounts.value.find((account) => String(account.id) === ledgerForm.value.ledger_account_id) ?? null
)

const computedUnitCost = computed(() => {
  const amount = Number(ledgerForm.value.amount)
  const quantity = Number(ledgerForm.value.quantity)

  if (!amount || !quantity) return null

  return amount / quantity
})

const computedUnitCostDisplay = computed(() =>
  computedUnitCost.value ? formatCurrency(computedUnitCost.value) : 'Calculated automatically'
)

const totalRecordedAmount = computed(() =>
  ledgerTransactions.value.reduce((sum, transaction) => sum + transaction.amount, 0)
)

const moneyInTotal = computed(() => ledgerTypeTotal('revenue'))

const moneyOutTotal = computed(() => ledgerTypeTotal('expense'))

const netProfit = computed(() => moneyInTotal.value - moneyOutTotal.value)

const recoveryRate = computed(() => {
  if (moneyOutTotal.value <= 0) return moneyInTotal.value > 0 ? 100 : 0
  return (moneyInTotal.value / moneyOutTotal.value) * 100
})

const recoveryRateLabel = computed(() => `${Math.round(recoveryRate.value)}%`)

const recoveryProgressWidth = computed(() => `${Math.min(Math.max(recoveryRate.value, 0), 100)}%`)

const profitabilityState = computed<'no-data' | 'cost-only' | 'loss' | 'break-even' | 'profit'>(() => {
  if (moneyInTotal.value <= 0 && moneyOutTotal.value <= 0) return 'no-data'
  if (moneyInTotal.value <= 0 && moneyOutTotal.value > 0) return 'cost-only'
  if (netProfit.value < 0) return 'loss'
  if (netProfit.value === 0) return 'break-even'
  return 'profit'
})

const profitabilityHeadline = computed(() => {
  switch (profitabilityState.value) {
    case 'profit':
      return 'This planting is making money'
    case 'break-even':
      return 'This planting has covered its costs'
    case 'loss':
      return 'This planting is still below break-even'
    case 'cost-only':
      return 'Costs are recorded, but sales are not yet recorded'
    default:
      return 'Start recording sales and costs for this planting'
  }
})

const profitabilityMessage = computed(() => {
  switch (profitabilityState.value) {
    case 'profit':
      return `You have recovered all recorded costs and are ahead by ${formatCurrency(netProfit.value)}.`
    case 'break-even':
      return 'Money in and money out are equal, so this planting is currently neither making a profit nor a loss.'
    case 'loss':
      return `You need ${formatCurrency(Math.abs(netProfit.value))} more in sales to recover the recorded costs.`
    case 'cost-only':
      return `You have recorded ${formatCurrency(moneyOutTotal.value)} in costs, but no income yet for this planting.`
    default:
      return 'Once you record money in and money out, this page will show whether the planting is profitable.'
  }
})

const profitOrLossLabel = computed(() => {
  if (profitabilityState.value === 'profit') return `${formatCurrency(netProfit.value)} profit`
  if (profitabilityState.value === 'break-even') return 'Break-even'
  if (profitabilityState.value === 'no-data') return 'No records yet'
  return `${formatCurrency(Math.abs(netProfit.value || moneyOutTotal.value))} to recover`
})

const netResultDescription = computed(() => {
  if (profitabilityState.value === 'profit') return 'This is what remains after paying the recorded costs.'
  if (profitabilityState.value === 'break-even') return 'All recorded costs have been covered.'
  if (profitabilityState.value === 'no-data') return 'Add transactions to see the result here.'
  return 'This is the amount still needed to reach break-even.'
})

const recoveryMessage = computed(() => {
  if (profitabilityState.value === 'no-data') return 'No sales or costs recorded yet.'
  if (profitabilityState.value === 'cost-only') return 'You have started recording costs. Add sales when harvest is sold.'
  if (profitabilityState.value === 'profit') return 'Your recorded income is above your recorded costs.'
  if (profitabilityState.value === 'break-even') return 'You have recovered 100% of the recorded costs.'
  return 'This shows how much of the recorded cost has already been recovered.'
})

const breakEvenMessage = computed(() => {
  if (profitabilityState.value === 'no-data') return 'Record spending and sales to track break-even for this planting.'
  if (profitabilityState.value === 'profit') return `Break-even reached. This planting is ahead by ${formatCurrency(netProfit.value)}.`
  if (profitabilityState.value === 'break-even') return 'Break-even reached. Every recorded cost has been covered.'
  return `Break-even gap: ${formatCurrency(Math.max(moneyOutTotal.value - moneyInTotal.value, 0))} still needed.`
})

const profitabilityBannerClass = computed(() => {
  if (profitabilityState.value === 'profit') return 'border-green-200 bg-green-50'
  if (profitabilityState.value === 'break-even') return 'border-blue-200 bg-blue-50'
  if (profitabilityState.value === 'no-data') return 'border-gray-200 bg-gray-50'
  return 'border-amber-200 bg-amber-50'
})

const profitabilityAccentClass = computed(() => {
  if (profitabilityState.value === 'profit') return 'text-green-700'
  if (profitabilityState.value === 'break-even') return 'text-blue-700'
  if (profitabilityState.value === 'no-data') return 'text-gray-600'
  return 'text-amber-700'
})

const profitOrLossClass = computed(() => {
  if (profitabilityState.value === 'profit') return 'text-green-700'
  if (profitabilityState.value === 'break-even') return 'text-blue-700'
  if (profitabilityState.value === 'no-data') return 'text-gray-700'
  return 'text-amber-700'
})

const netResultCardClass = computed(() => {
  if (profitabilityState.value === 'profit') return 'border-green-100 bg-green-50'
  if (profitabilityState.value === 'break-even') return 'border-blue-100 bg-blue-50'
  if (profitabilityState.value === 'no-data') return 'border-gray-200 bg-gray-50'
  return 'border-amber-100 bg-amber-50'
})

const ledgerTypeCount = (type: LedgerType) =>
  ledgerTransactions.value.filter((transaction) => transaction.type === type).length

const ledgerTypeTotal = (type: LedgerType) =>
  ledgerTransactions.value
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0)

const handleTabChange = (tab: PlantingTab) => {
  if (activeTab.value === tab) return

  activeTab.value = tab

  if (tab === 'overview') {
    fetchLedgerTransactions()
  }
}

const selectLedgerType = (type: LedgerType) => {
  ledgerForm.value.type = type
  ledgerForm.value.ledger_account_id = ''
  ledgerAccountSearch.value = ''
  showLedgerAccountResults.value = true
}

const handleLedgerAccountSearch = () => {
  ledgerForm.value.ledger_account_id = ''
  showLedgerAccountResults.value = true
}

const selectLedgerAccount = (account: LedgerAccount) => {
  ledgerForm.value.ledger_account_id = String(account.id)
  ledgerAccountSearch.value = account.name
  showLedgerAccountResults.value = false
}

const openLedgerModal = () => {
  ledgerSubmitError.value = null
  ledgerFormErrors.value = {}
  ledgerErrorList.value = []
  ledgerForm.value = defaultLedgerForm()
  ledgerAccountSearch.value = ''
  showLedgerAccountResults.value = false
  showAddLedgerModal.value = true
}

const closeLedgerModal = () => {
  showAddLedgerModal.value = false
  ledgerSubmitError.value = null
  ledgerFormErrors.value = {}
  ledgerErrorList.value = []
  showLedgerAccountResults.value = false
}

const setLedgerValidationErrors = (errors: Record<string, string[] | string> | undefined) => {
  const mapped: LedgerValidationErrors = {}
  const list: string[] = []

  if (!errors) {
    ledgerFormErrors.value = {}
    ledgerErrorList.value = []
    return
  }

  for (const [key, value] of Object.entries(errors)) {
    const message = Array.isArray(value) ? value[0] : value
    if (!message) continue

    list.push(message)

    if (key === 'entries.0.ledger_account_id' || key === 'ledger_account_id') mapped.ledger_account_id = message
    if (key === 'date') mapped.date = message
    if (key === 'entries.0.amount' || key === 'amount') mapped.amount = message
    if (key === 'entries.0.quantity' || key === 'quantity') mapped.quantity = message
    if (key === 'payment_method') mapped.payment_method = message
    if (key === 'reference_number') mapped.reference_number = message
    if (key === 'description' || key === 'notes') mapped.description = message
  }

  ledgerFormErrors.value = mapped
  ledgerErrorList.value = [...new Set(list)]
}

const toNumberOrNull = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const mapTransactionToRow = (transaction: LedgerTransactionListItem): LedgerTransactionRow[] => {
  const entries = transaction.ledger_entries ?? transaction.entries ?? []

  return entries.map((entry, index) => {
    const account = entry.ledger_account ?? entry.ledgerAccount ?? null
    const amount = toNumberOrNull(entry.amount) ?? 0
    const quantity = toNumberOrNull(entry.quantity)
    const unitCost = toNumberOrNull(entry.unit_cost)

    return {
      id: `${transaction.id ?? transaction.uuid ?? 'txn'}-${index}`,
      date: transaction.date ?? '',
      type: account?.type ?? 'expense',
      account_name: account?.name ?? 'Unknown account',
      amount,
      quantity,
      unit_cost: unitCost,
      payment_method: transaction.payment_method ?? null,
      notes: transaction.description ?? null,
      reference_number: transaction.reference_number ?? null,
    }
  })
}

const submitLedgerTransaction = async () => {
  if (!planting.value) return

  if (!ledgerForm.value.ledger_account_id) {
    ledgerSubmitError.value = 'Please choose a ledger account before saving.'
    ledgerFormErrors.value = { ledger_account_id: 'Please choose a ledger account before saving.' }
    ledgerErrorList.value = ['Please choose a ledger account before saving.']
    return
  }

  ledgerSubmitting.value = true
  ledgerSubmitError.value = null
  ledgerFormErrors.value = {}
  ledgerErrorList.value = []

  const amount = Number(ledgerForm.value.amount)
  const quantity = ledgerForm.value.quantity ? Number(ledgerForm.value.quantity) : null
  const unitCost = quantity && amount ? amount / quantity : null

  const payload = {
    date: ledgerForm.value.date,
    payment_method: ledgerForm.value.payment_method || null,
    description: ledgerForm.value.notes || null,
    reference_number: ledgerForm.value.reference_number || null,
    transaction_for: 'planting',
    type: ledgerForm.value.type,
    transaction_uuid: planting.value.uuid,
    entries: [
      {
        ledger_account_id: Number(ledgerForm.value.ledger_account_id),
        amount,
        quantity,
        unit_cost: unitCost,
      }
    ]
  }

  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch<{ data?: { id?: number | string } }>(
      '/api/v1/farms/farm/transactions',
      {
        method: 'POST',
        body: payload
      }
    )

    await fetchLedgerTransactions()

    closeLedgerModal()
  } catch (err: unknown) {
    const responseData = typeof err === 'object' && err !== null && 'data' in err
      ? (err as { data?: { message?: string; errors?: Record<string, string[] | string> } }).data
      : undefined

    setLedgerValidationErrors(responseData?.errors)
    ledgerSubmitError.value = responseData?.message ?? (err instanceof Error ? err.message : 'Failed to save transaction')
    console.error('Failed to save ledger transaction:', err)
  } finally {
    ledgerSubmitting.value = false
  }
}

const fetchLedgerAccounts = async () => {
  try {
    if (!isOnline.value) {
      ledgerAccounts.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data: LedgerAccount[] }>('/api/v1/settings/system/ledgeraccounts/list')
    ledgerAccounts.value = response.data ?? []
  } catch (err) {
    console.error('Failed to fetch ledger accounts:', err)
    ledgerAccounts.value = []
  }
}

const fetchLedgerTransactions = async () => {
  try {
    if (!isOnline.value) {
      ledgerTransactions.value = []
      return
    }

    await $apiFetch('/sanctum/csrf-cookie')
    const response = await $apiFetch<{ data?: LedgerTransactionListItem[] }>('/api/v1/farms/farm/transactions/list')
    const records = response.data ?? []

    ledgerTransactions.value = records
      .filter((transaction) => transaction.transaction_for === 'planting' && transaction.transaction_uuid === plantingUuid.value)
      .flatMap(mapTransactionToRow)
  } catch (err) {
    console.error('Failed to fetch ledger transactions:', err)
    ledgerTransactions.value = []
  }
}

const fetchPlanting = async () => {
  loading.value = true
  error.value = null

  try {
    if (isOnline.value) {
      await $apiFetch('/sanctum/csrf-cookie')
      const response = await $apiFetch<{ data: Planting }>(`/api/v1/farms/farm/planting/${plantingUuid.value}`)
      planting.value = response.data
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An error occurred while loading this planting'
    console.error('Failed to fetch planting:', err)
    error.value = msg
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)

onMounted(() => {
  fetchPlanting()
  fetchLedgerAccounts()
  fetchLedgerTransactions()
})
</script>
