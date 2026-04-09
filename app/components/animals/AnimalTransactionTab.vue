<template>
  <div>
    <div class="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Ledger Transactions</h2>
        <p class="mt-0.5 text-sm text-gray-500">Record money in, money out, assets, liabilities, and owner investment for this animal.</p>
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
          <div class="rounded-lg border border-green-100 bg-green-50 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-green-700">Money In</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ formatCurrency(moneyInTotal) }}</p>
            <p class="mt-1 text-sm text-green-800">Sales and other income recorded for this animal.</p>
          </div>

          <div class="rounded-lg border border-red-100 bg-red-50 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-red-700">Money Out</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ formatCurrency(moneyOutTotal) }}</p>
            <p class="mt-1 text-sm text-red-800">Feed, medicine, labour, and other costs recorded.</p>
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

    <Teleport to="body">
      <div v-if="showAddLedgerModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeLedgerModal"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 class="text-lg font-semibold text-gray-900">Create New Transaction</h3>
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
import { Plus, X } from 'lucide-vue-next'

const props = defineProps<{ animalUuid: string; trackingType?: 'individual' | 'group' }>()

const {
  ledgerTypeOptions,
  ledgerTypeConfig,
  ledgerTransactions,
  ledgerAccountSearch,
  showLedgerAccountResults,
  showAddLedgerModal,
  ledgerSubmitting,
  ledgerSubmitError,
  ledgerFormErrors,
  ledgerErrorList,
  ledgerForm,
  filteredLedgerAccounts,
  searchedLedgerAccounts,
  selectedLedgerAccount,
  computedUnitCostDisplay,
  moneyInTotal,
  moneyOutTotal,
  netProfit,
  recoveryRateLabel,
  recoveryProgressWidth,
  netResultDescription,
  recoveryMessage,
  breakEvenMessage,
  profitabilityAccentClass,
  netResultCardClass,
  ledgerTypeCount,
  ledgerTypeTotal,
  formatCurrency,
  selectLedgerType,
  handleLedgerAccountSearch,
  selectLedgerAccount,
  openLedgerModal,
  closeLedgerModal,
  submitLedgerTransaction,
} = useAnimalTransactions(props.animalUuid, props.trackingType ?? 'individual')
</script>
