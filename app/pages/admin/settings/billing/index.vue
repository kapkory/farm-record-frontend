<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Billing &amp; Plan</h1>
      <p class="text-sm text-gray-500 mt-1">Your Farmconsul subscription. Payments are confirmed by the Farmconsul team — reach out on M-Pesa and we activate your plan.</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
      <span class="ml-3 text-gray-600">Loading billing details...</span>
    </div>

    <div v-else-if="loadError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ loadError }}
      <button class="ml-2 underline hover:no-underline" @click="fetchBilling">Try again</button>
    </div>

    <template v-else>
      <!-- Current subscription -->
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <div v-if="subscription" class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Current plan</p>
            <p class="mt-1 text-xl font-bold text-gray-900">
              {{ subscription.plan?.name ?? 'No plan' }}
              <span class="ml-2 align-middle" :class="subscriptionStatusBadge(subscription.effective_status)">
                {{ SUBSCRIPTION_STATUS_LABELS[subscription.effective_status] ?? subscription.effective_status }}
              </span>
            </p>
            <p class="mt-1 text-sm text-gray-500">{{ formatPlanPrice(subscription.plan) }}</p>
          </div>
          <div class="text-sm text-gray-600">
            <p v-if="subscription.effective_status === 'trialing' && subscription.trial_ends_at">
              Trial ends <span class="font-semibold text-gray-900">{{ formatDate(subscription.trial_ends_at) }}</span>
              <span v-if="subscription.days_remaining !== null" class="text-gray-400">({{ subscription.days_remaining }} day{{ subscription.days_remaining === 1 ? '' : 's' }} left)</span>
            </p>
            <p v-else-if="subscription.current_period_end">
              Paid until <span class="font-semibold text-gray-900">{{ formatDate(subscription.current_period_end) }}</span>
            </p>
            <p v-if="subscription.effective_status === 'past_due'" class="mt-1 font-medium text-amber-700">
              Your plan needs a payment to stay active. Your records are safe.
            </p>
          </div>
        </div>
        <div v-else class="text-sm text-gray-600">
          You are not on a plan yet. Pick one below to start your free trial — no payment needed to begin.
        </div>
      </div>

      <!-- Plans -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          v-for="plan in plans"
          :key="plan.uuid"
          class="flex flex-col rounded-xl border bg-white p-5"
          :class="isCurrentPlan(plan) ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-200'"
        >
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900">{{ plan.name }}</h3>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ formatPlanPrice(plan) }}</p>
            <p v-if="plan.description" class="mt-1 text-sm text-gray-500">{{ plan.description }}</p>
            <ul class="mt-3 space-y-1.5">
              <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-sm text-gray-600">
                <Check class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                {{ feature }}
              </li>
            </ul>
          </div>
          <Button
            type="button"
            class="mt-4 w-full"
            :disabled="subscribing || isCurrentPlan(plan)"
            :variant="isCurrentPlan(plan) ? 'outline' : undefined"
            @click="pick(plan)"
          >
            {{ isCurrentPlan(plan) ? 'Current plan' : (subscription ? 'Switch to this plan' : `Start ${plan.trial_days}-day free trial`) }}
          </Button>
        </div>
      </div>

      <p v-if="actionError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ actionError }}</p>

      <!-- Payment history -->
      <div v-if="subscription?.payments?.length" class="rounded-xl border border-gray-200 bg-white">
        <div class="border-b border-gray-200 px-5 py-3">
          <h2 class="text-sm font-semibold text-gray-900">Payment history</h2>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-5 py-2.5 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th class="px-5 py-2.5 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
              <th class="px-5 py-2.5 text-left text-xs font-medium uppercase text-gray-500">Method</th>
              <th class="px-5 py-2.5 text-left text-xs font-medium uppercase text-gray-500">Covers until</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="p in subscription.payments" :key="p.uuid">
              <td class="px-5 py-2.5 text-sm text-gray-600">{{ formatDate(p.paid_at) }}</td>
              <td class="px-5 py-2.5 text-right text-sm font-medium text-gray-900">{{ p.currency }} {{ Number(p.amount).toLocaleString('en-KE') }}</td>
              <td class="px-5 py-2.5 text-sm capitalize text-gray-600">{{ p.method.replace('_', ' ') }}</td>
              <td class="px-5 py-2.5 text-sm text-gray-600">{{ p.period_end ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { SUBSCRIPTION_STATUS_LABELS, subscriptionStatusBadge, formatPlanPrice, type BillingPlan } from '../../../../composables/useBilling'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

const { plans, subscription, loading, loadError, subscribing, fetchBilling, choosePlan } = useBilling()

const actionError = ref<string | null>(null)

const isCurrentPlan = (plan: BillingPlan) =>
  subscription.value?.plan?.uuid === plan.uuid && subscription.value?.effective_status !== 'expired'

const pick = async (plan: BillingPlan) => {
  actionError.value = null
  const result = await choosePlan(plan.uuid)
  if (!result.ok) actionError.value = result.message
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(fetchBilling)

useHead({ title: 'Billing & Plan — Farmconsul' })
</script>
