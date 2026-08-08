// Public plan catalogue for the logged-out pages (/plans, /register).
//
// Shows a static copy of the seeded catalogue immediately (so prerendered
// HTML has real content and the pages work offline), then swaps in the live
// catalogue from the public endpoint. Fallback entries carry no uuid — a
// registration submitted against them simply starts without a plan.
import type { BillingPlan } from './useBilling'

/**
 * Mirrors the seeded catalogue so prerendered HTML has real content before the
 * live endpoint answers. Keep this in step with PlansSeeder — while the
 * product is in testing that is a single free six-month plan, so the register
 * page must not flash a paid picker on first paint.
 */
export const FALLBACK_PLANS: BillingPlan[] = [
  {
    uuid: '',
    slug: 'free-trial',
    name: 'Free Trial',
    price: 0,
    currency: 'KES',
    interval: 'monthly',
    trial_days: 180,
    description: 'Full access to everything while we are in testing. Six months free, no payment details needed.',
    features: [
      'Every feature, no limits',
      'Unlimited farms, animals and team members',
      'Crops, livestock, bees and beekeeping',
      'Sales, costs and profitability',
      'Offline mobile app'
    ],
    max_farms: null,
    max_animals: null,
    max_users: null
  }
]

export const planLimitsLabel = (plan: BillingPlan) => {
  if (!plan.max_farms && !plan.max_animals && !plan.max_users) return 'Unlimited farms, animals & team'
  const parts: string[] = []
  if (plan.max_farms) parts.push(`${plan.max_farms} farm${plan.max_farms === 1 ? '' : 's'}`)
  if (plan.max_animals) parts.push(`${plan.max_animals} animals`)
  if (plan.max_users) parts.push(`${plan.max_users} team member${plan.max_users === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

export const usePublicPlans = () => {
  const plans = ref<BillingPlan[]>(FALLBACK_PLANS)

  // Call from onMounted only — these pages are prerendered in Node, where
  // there is no API to reach.
  const fetchPublicPlans = async () => {
    try {
      const { $apiFetch } = useNuxtApp()
      const res = await $apiFetch<any>('/api/v1/public/plans')
      if (Array.isArray(res?.data) && res.data.length) {
        plans.value = res.data
      }
    } catch {
      // Keep the fallback catalogue.
    }
  }

  return { plans, fetchPublicPlans }
}
