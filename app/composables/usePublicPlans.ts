// Public plan catalogue for the logged-out pages (/plans, /register).
//
// Shows a static copy of the seeded catalogue immediately (so prerendered
// HTML has real content and the pages work offline), then swaps in the live
// catalogue from the public endpoint. Fallback entries carry no uuid — a
// registration submitted against them simply starts without a plan.
import type { BillingPlan } from './useBilling'

export const FALLBACK_PLANS: BillingPlan[] = [
  { uuid: '', slug: 'starter', name: 'Starter', price: 2500, currency: 'KES', interval: 'monthly', trial_days: 14, description: 'For a single small farm getting started.', features: ['Basic crop tracking', 'Up to 50 animals', 'Record sales and costs', 'Offline mobile app'], max_farms: 1, max_animals: 50, max_users: 2 },
  { uuid: '', slug: 'professional', name: 'Professional', price: 5000, currency: 'KES', interval: 'monthly', trial_days: 14, description: 'For growing farms that need the full toolkit.', features: ['Everything in Starter', 'Up to 5 farms', 'Breeding & treatment planning', 'Reports and profitability', 'Team roles'], max_farms: 5, max_animals: 500, max_users: 10 },
  { uuid: '', slug: 'enterprise', name: 'Enterprise', price: 10000, currency: 'KES', interval: 'monthly', trial_days: 14, description: 'For cooperatives and large operations.', features: ['Everything in Professional', 'Unlimited farms & animals', 'Unlimited team members', 'Priority support'], max_farms: null, max_animals: null, max_users: null }
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
