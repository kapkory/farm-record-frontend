<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Platform Billing</h1>
        <p class="text-sm text-gray-500 mt-1">Every farmer's subscription, payments and the plan catalogue.</p>
      </div>
      <div class="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
        <button
          v-for="tab in ['subscriptions', 'plans']"
          :key="tab"
          type="button"
          class="px-4 py-2 text-sm font-medium capitalize transition-colors"
          :class="activeTab === tab ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <div v-if="!authStore.isSuperAdmin" class="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-red-700">
      This area is restricted to platform administrators.
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-xl border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Monthly revenue (MRR)</p>
          <p class="mt-1 text-xl font-bold text-gray-900">KES {{ Number(stats.mrr ?? 0).toLocaleString('en-KE') }}</p>
          <p class="mt-0.5 text-xs text-gray-400">KES {{ Number(stats.collected_this_month ?? 0).toLocaleString('en-KE') }} collected this month</p>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Active</p>
          <p class="mt-1 text-xl font-bold text-green-600">{{ stats.active ?? 0 }}</p>
          <p class="mt-0.5 text-xs text-gray-400">of {{ stats.total ?? 0 }} subscriptions</p>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Trialing</p>
          <p class="mt-1 text-xl font-bold text-blue-600">{{ stats.trialing ?? 0 }}</p>
        </div>
        <div class="rounded-xl border p-4" :class="(stats.past_due ?? 0) > 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'">
          <p class="text-xs font-semibold uppercase tracking-wide" :class="(stats.past_due ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400'">Payment due</p>
          <p class="mt-1 text-xl font-bold" :class="(stats.past_due ?? 0) > 0 ? 'text-amber-700' : 'text-gray-900'">{{ stats.past_due ?? 0 }}</p>
          <p class="mt-0.5 text-xs text-gray-400">{{ stats.expired ?? 0 }} expired · {{ stats.canceled ?? 0 }} canceled</p>
        </div>
      </div>

      <!-- ── Subscriptions tab ─────────────────────────────────────────── -->
      <template v-if="activeTab === 'subscriptions'">
        <div class="flex flex-wrap items-center gap-3">
          <Input v-model="search" type="text" placeholder="Search farmer…" class="w-56" @input="debouncedFetchSubs" />
          <select v-model="statusFilter" class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" @change="fetchSubscriptions">
            <option value="">All statuses</option>
            <option v-for="(label, value) in SUBSCRIPTION_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white">
          <div v-if="busy" class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
          </div>
          <div v-else-if="!subscriptions.length" class="p-10 text-center text-sm text-gray-500">
            No subscriptions match. Farmers appear here after choosing a plan (or you assign one).
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Farmer</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Plan</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Paid / trial until</th>
                  <th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="sub in subscriptions" :key="sub.uuid" class="hover:bg-gray-50">
                  <td class="px-5 py-3 text-sm font-medium text-gray-900">{{ sub.farmer?.display_name ?? '—' }}</td>
                  <td class="px-5 py-3 text-sm text-gray-600">
                    {{ sub.plan?.name ?? 'No plan' }}
                    <span class="block text-xs text-gray-400">{{ formatPlanPrice(sub.plan) }}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span :class="subscriptionStatusBadge(sub.effective_status)">{{ SUBSCRIPTION_STATUS_LABELS[sub.effective_status] ?? sub.effective_status }}</span>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-600">
                    {{ formatDate(sub.effective_status === 'trialing' ? sub.trial_ends_at : sub.current_period_end) }}
                    <span v-if="sub.days_remaining !== null" class="block text-xs" :class="sub.days_remaining < 0 ? 'text-red-500' : 'text-gray-400'">
                      {{ sub.days_remaining < 0 ? `${Math.abs(sub.days_remaining)}d overdue` : `${sub.days_remaining}d left` }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right text-sm whitespace-nowrap">
                    <button class="font-medium text-green-600 hover:text-green-700" @click="openPayment(sub)">Record payment</button>
                    <button class="ml-3 font-medium text-blue-600 hover:text-blue-700" @click="openAssign(sub)">Change plan</button>
                    <button v-if="sub.effective_status !== 'canceled'" class="ml-3 font-medium text-red-600 hover:text-red-700" @click="cancelSub(sub)">Cancel</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ── Plans tab ─────────────────────────────────────────────────── -->
      <template v-else>
        <div class="flex justify-end">
          <Button type="button" @click="openPlanModal()">
            <Plus class="mr-2 h-4 w-4" />
            New Plan
          </Button>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Plan</th>
                <th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">Price</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Trial</th>
                <th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">Subscribers</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="plan in adminPlans" :key="plan.uuid" :class="{ 'opacity-60': !plan.is_active }">
                <td class="px-5 py-3">
                  <p class="text-sm font-medium text-gray-900">{{ plan.name }}</p>
                  <p class="text-xs text-gray-400">{{ plan.description || '—' }}</p>
                </td>
                <td class="px-5 py-3 text-right text-sm font-medium text-gray-900">{{ formatPlanPrice(plan) }}</td>
                <td class="px-5 py-3 text-sm text-gray-600">{{ plan.trial_days }} days</td>
                <td class="px-5 py-3 text-right text-sm text-gray-600">{{ plan.subscribers_count ?? 0 }}</td>
                <td class="px-5 py-3">
                  <span :class="plan.is_active ? 'inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800' : 'inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500'">
                    {{ plan.is_active ? 'Active' : 'Archived' }}
                  </span>
                </td>
                <td class="px-5 py-3 text-right text-sm whitespace-nowrap">
                  <button class="font-medium text-green-600 hover:text-green-700" @click="openPlanModal(plan)">Edit</button>
                  <button class="ml-3 font-medium text-red-600 hover:text-red-700" @click="deletePlan(plan)">
                    {{ (plan.subscribers_count ?? 0) > 0 ? 'Archive' : 'Delete' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <p v-if="actionError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ actionError }}</p>
    </template>

    <!-- Record payment modal -->
    <Teleport to="body">
      <div v-if="paymentSub" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="paymentSub = null"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900">Record payment</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ paymentSub.farmer?.display_name }} · {{ paymentSub.plan?.name ?? 'No plan' }}.
              Extends the paid-through date by one {{ paymentSub.plan?.interval === 'yearly' ? 'year' : 'month' }}.
            </p>
            <div class="mt-4 space-y-3">
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Amount (KES)</Label>
                <Input v-model="paymentForm.amount" type="number" step="0.01" min="0" class="w-full" />
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Method</Label>
                <div class="flex gap-2">
                  <button
                    v-for="m in ['mpesa', 'bank', 'cash', 'manual']"
                    :key="m"
                    type="button"
                    :class="['rounded-full border px-3 py-1.5 text-sm font-medium capitalize', paymentForm.method === m ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-600']"
                    @click="paymentForm.method = m"
                  >{{ m }}</button>
                </div>
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Reference <span class="font-normal text-gray-400">(e.g. M-Pesa code)</span></Label>
                <Input v-model="paymentForm.reference" type="text" class="w-full" />
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Notes</Label>
                <Input v-model="paymentForm.notes" type="text" class="w-full" />
              </div>
            </div>
            <div class="mt-5 flex justify-end gap-3">
              <button type="button" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="paymentSub = null">Cancel</button>
              <Button type="button" :disabled="busyAction || !Number(paymentForm.amount)" @click="submitPayment">
                {{ busyAction ? 'Saving…' : 'Save payment' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Assign plan modal -->
    <Teleport to="body">
      <div v-if="assignSub" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="assignSub = null"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900">Change plan</h3>
            <p class="mt-1 text-sm text-gray-500">{{ assignSub.farmer?.display_name }}</p>
            <div class="mt-4">
              <Label class="mb-1 block text-sm font-medium text-gray-700">Plan</Label>
              <select v-model="assignPlanUuid" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option v-for="plan in adminPlans.filter(p => p.is_active)" :key="plan.uuid" :value="plan.uuid">
                  {{ plan.name }} — {{ formatPlanPrice(plan) }}
                </option>
              </select>
            </div>
            <div class="mt-5 flex justify-end gap-3">
              <button type="button" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="assignSub = null">Cancel</button>
              <Button type="button" :disabled="busyAction || !assignPlanUuid" @click="submitAssign">
                {{ busyAction ? 'Saving…' : 'Assign plan' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Plan create/edit modal -->
    <Teleport to="body">
      <div v-if="showPlanModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="showPlanModal = false"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900">{{ planForm.uuid ? 'Edit plan' : 'New plan' }}</h3>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <Label class="mb-1 block text-sm font-medium text-gray-700">Name</Label>
                <Input v-model="planForm.name" type="text" class="w-full" />
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Price (KES)</Label>
                <Input v-model="planForm.price" type="number" step="0.01" min="0" class="w-full" />
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Billing interval</Label>
                <select v-model="planForm.interval" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Trial days</Label>
                <Input v-model="planForm.trial_days" type="number" min="0" max="365" class="w-full" />
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium text-gray-700">Sort order</Label>
                <Input v-model="planForm.sort_order" type="number" min="0" class="w-full" />
              </div>
              <div class="col-span-2">
                <Label class="mb-1 block text-sm font-medium text-gray-700">Description</Label>
                <Input v-model="planForm.description" type="text" class="w-full" />
              </div>
              <div class="col-span-2">
                <Label class="mb-1 block text-sm font-medium text-gray-700">Features <span class="font-normal text-gray-400">(one per line)</span></Label>
                <textarea v-model="planForm.featuresText" rows="4" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
              </div>
              <label class="col-span-2 flex items-center gap-2 text-sm text-gray-700">
                <input v-model="planForm.is_active" type="checkbox" class="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                Visible to farmers
              </label>
            </div>
            <div class="mt-5 flex justify-end gap-3">
              <button type="button" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="showPlanModal = false">Cancel</button>
              <Button type="button" :disabled="busyAction || !planForm.name || planForm.price === ''" @click="savePlan">
                {{ busyAction ? 'Saving…' : 'Save plan' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import {
  SUBSCRIPTION_STATUS_LABELS,
  subscriptionStatusBadge,
  formatPlanPrice,
  type BillingPlan,
  type BillingSubscription
} from '../../../../composables/useBilling'

definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

const authStore = useAuthStore()
const { $apiFetch } = useNuxtApp()

const activeTab = ref<'subscriptions' | 'plans'>('subscriptions')
const stats = ref<Record<string, number>>({})
const subscriptions = ref<BillingSubscription[]>([])
const adminPlans = ref<BillingPlan[]>([])
const busy = ref(false)
const busyAction = ref(false)
const actionError = ref<string | null>(null)
const search = ref('')
const statusFilter = ref('')

const fetchStats = async () => {
  try {
    const res = await $apiFetch<any>('/api/v1/admin/subscriptions/stats')
    stats.value = res?.data ?? {}
  } catch { /* stats are decorative; the tables still work */ }
}

const fetchSubscriptions = async () => {
  busy.value = true
  try {
    const params = new URLSearchParams()
    if (search.value) params.set('search', search.value)
    if (statusFilter.value) params.set('status', statusFilter.value)
    const res = await $apiFetch<any>(`/api/v1/admin/subscriptions?${params}`)
    subscriptions.value = res?.data ?? []
  } catch (err: any) {
    actionError.value = err?.data?.message ?? 'Failed to load subscriptions.'
  } finally {
    busy.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
const debouncedFetchSubs = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchSubscriptions, 350)
}

const fetchPlans = async () => {
  try {
    const res = await $apiFetch<any>('/api/v1/admin/plans')
    adminPlans.value = res?.data ?? []
  } catch (err: any) {
    actionError.value = err?.data?.message ?? 'Failed to load plans.'
  }
}

// ── Payment modal ──────────────────────────────────────────────────────────
const paymentSub = ref<BillingSubscription | null>(null)
const paymentForm = ref({ amount: '', method: 'mpesa', reference: '', notes: '' })

const openPayment = (sub: BillingSubscription) => {
  paymentForm.value = { amount: String(sub.plan?.price ?? ''), method: 'mpesa', reference: '', notes: '' }
  paymentSub.value = sub
}

const submitPayment = async () => {
  if (!paymentSub.value) return
  busyAction.value = true
  actionError.value = null
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch(`/api/v1/admin/subscriptions/${paymentSub.value.uuid}/payments`, {
      method: 'POST',
      body: {
        amount: Number(paymentForm.value.amount),
        method: paymentForm.value.method,
        reference: paymentForm.value.reference || null,
        notes: paymentForm.value.notes || null
      }
    })
    paymentSub.value = null
    await Promise.all([fetchSubscriptions(), fetchStats()])
  } catch (err: any) {
    actionError.value = err?.data?.message ?? 'Could not record the payment.'
  } finally {
    busyAction.value = false
  }
}

// ── Assign plan modal ──────────────────────────────────────────────────────
const assignSub = ref<BillingSubscription | null>(null)
const assignPlanUuid = ref('')

const openAssign = (sub: BillingSubscription) => {
  assignPlanUuid.value = sub.plan?.uuid ?? ''
  assignSub.value = sub
}

const submitAssign = async () => {
  if (!assignSub.value?.farmer?.uuid) return
  busyAction.value = true
  actionError.value = null
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch(`/api/v1/admin/subscriptions/assign/${assignSub.value.farmer.uuid}`, {
      method: 'POST',
      body: { plan_uuid: assignPlanUuid.value }
    })
    assignSub.value = null
    await Promise.all([fetchSubscriptions(), fetchStats()])
  } catch (err: any) {
    actionError.value = err?.data?.message ?? 'Could not assign the plan.'
  } finally {
    busyAction.value = false
  }
}

const cancelSub = async (sub: BillingSubscription) => {
  if (!window.confirm(`Cancel ${sub.farmer?.display_name}'s subscription? They keep access until the paid-through date.`)) return
  busyAction.value = true
  actionError.value = null
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch(`/api/v1/admin/subscriptions/${sub.uuid}/cancel`, { method: 'POST' })
    await Promise.all([fetchSubscriptions(), fetchStats()])
  } catch (err: any) {
    actionError.value = err?.data?.message ?? 'Could not cancel the subscription.'
  } finally {
    busyAction.value = false
  }
}

// ── Plan CRUD ──────────────────────────────────────────────────────────────
const showPlanModal = ref(false)
const planForm = ref({
  uuid: '' as string,
  name: '',
  price: '' as string | number,
  interval: 'monthly',
  trial_days: 14 as string | number,
  sort_order: 0 as string | number,
  description: '',
  featuresText: '',
  is_active: true
})

const openPlanModal = (plan?: BillingPlan) => {
  planForm.value = plan
    ? {
        uuid: plan.uuid,
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        trial_days: plan.trial_days,
        sort_order: (plan as any).sort_order ?? 0,
        description: plan.description ?? '',
        featuresText: (plan.features ?? []).join('\n'),
        is_active: plan.is_active ?? true
      }
    : { uuid: '', name: '', price: '', interval: 'monthly', trial_days: 14, sort_order: 0, description: '', featuresText: '', is_active: true }
  showPlanModal.value = true
}

const savePlan = async () => {
  busyAction.value = true
  actionError.value = null
  const body = {
    name: planForm.value.name,
    price: Number(planForm.value.price),
    interval: planForm.value.interval,
    trial_days: Number(planForm.value.trial_days) || 0,
    sort_order: Number(planForm.value.sort_order) || 0,
    description: planForm.value.description || null,
    features: planForm.value.featuresText.split('\n').map(f => f.trim()).filter(Boolean),
    is_active: planForm.value.is_active
  }
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    if (planForm.value.uuid) {
      await $apiFetch(`/api/v1/admin/plans/${planForm.value.uuid}`, { method: 'PUT', body })
    } else {
      await $apiFetch('/api/v1/admin/plans', { method: 'POST', body })
    }
    showPlanModal.value = false
    await fetchPlans()
  } catch (err: any) {
    actionError.value = err?.data?.message ?? 'Could not save the plan.'
  } finally {
    busyAction.value = false
  }
}

const deletePlan = async (plan: BillingPlan) => {
  const verb = (plan.subscribers_count ?? 0) > 0 ? 'Archive' : 'Delete'
  if (!window.confirm(`${verb} the ${plan.name} plan?`)) return
  busyAction.value = true
  actionError.value = null
  try {
    await $apiFetch('/sanctum/csrf-cookie')
    await $apiFetch(`/api/v1/admin/plans/${plan.uuid}`, { method: 'DELETE' })
    await fetchPlans()
  } catch (err: any) {
    actionError.value = err?.data?.message ?? 'Could not delete the plan.'
  } finally {
    busyAction.value = false
  }
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(() => {
  if (!authStore.isSuperAdmin) return
  fetchStats()
  fetchSubscriptions()
  fetchPlans()
})

useHead({ title: 'Platform Billing — Farmconsul' })
</script>
