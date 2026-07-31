// Billing — farmer-facing subscription state + plan catalogue.
//
// Online-first: billing is an account-level concern (not field data), so it
// reads live and falls back to a cached copy for display only. Choosing a
// plan starts a trial; payments are recorded by the Farmconsul team, so
// there is no client-side payment flow.

export interface BillingPlan {
  uuid: string
  name: string
  slug: string
  description?: string | null
  price: number
  currency: string
  interval: string
  trial_days: number
  max_farms?: number | null
  max_animals?: number | null
  max_users?: number | null
  features: string[]
  is_active?: boolean
  subscribers_count?: number
}

export interface BillingSubscription {
  uuid: string
  status: string
  effective_status: string
  days_remaining: number | null
  started_at?: string | null
  trial_ends_at?: string | null
  current_period_end?: string | null
  canceled_at?: string | null
  notes?: string | null
  plan?: BillingPlan | null
  farmer?: { uuid: string, display_name: string } | null
  payments?: Array<{
    uuid: string
    amount: number
    currency: string
    method: string
    reference?: string | null
    period_end?: string | null
    paid_at?: string | null
    recorded_by?: string | null
  }>
}

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  trialing: 'Free trial',
  active: 'Active',
  past_due: 'Payment due',
  expired: 'Expired',
  canceled: 'Canceled'
}

export const subscriptionStatusBadge = (status: string | undefined) => {
  const base = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold'
  if (status === 'active') return `${base} bg-green-100 text-green-800`
  if (status === 'trialing') return `${base} bg-blue-100 text-blue-800`
  if (status === 'past_due') return `${base} bg-amber-100 text-amber-800`
  if (status === 'expired') return `${base} bg-red-100 text-red-800`
  if (status === 'canceled') return `${base} bg-gray-100 text-gray-500`
  return `${base} bg-gray-100 text-gray-700`
}

export const formatPlanPrice = (plan: BillingPlan | null | undefined) => {
  if (!plan) return '—'
  const amount = Number(plan.price ?? 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })
  return `${plan.currency ?? 'KES'} ${amount}/${plan.interval === 'yearly' ? 'yr' : 'mo'}`
}

export const useBilling = () => {
  const { $apiFetch } = useNuxtApp()

  const plans = ref<BillingPlan[]>([])
  const subscription = ref<BillingSubscription | null>(null)
  const loading = ref(false)
  const loadError = ref<string | null>(null)
  const subscribing = ref(false)

  const fetchBilling = async () => {
    loading.value = true
    loadError.value = null
    try {
      const [plansRes, subRes] = await Promise.all([
        $apiFetch<any>('/api/v1/billing/plans'),
        $apiFetch<any>('/api/v1/billing/subscription')
      ])
      plans.value = plansRes?.data ?? []
      subscription.value = subRes?.data ?? null
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load billing details'
    } finally {
      loading.value = false
    }
  }

  const choosePlan = async (planUuid: string) => {
    subscribing.value = true
    try {
      await $apiFetch('/sanctum/csrf-cookie')
      const res = await $apiFetch<any>('/api/v1/billing/subscribe', {
        method: 'POST',
        body: { plan_uuid: planUuid }
      })
      subscription.value = res?.data ?? subscription.value
      return { ok: true as const }
    } catch (err: any) {
      return { ok: false as const, message: err?.data?.message ?? 'Could not update your plan.' }
    } finally {
      subscribing.value = false
    }
  }

  return {
    plans,
    subscription,
    loading,
    loadError,
    subscribing,
    fetchBilling,
    choosePlan
  }
}
