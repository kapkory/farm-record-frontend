<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-farm-green rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Farmconsul</h1>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink to="/login" class="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </NuxtLink>
            <NuxtLink to="/register" class="bg-farm-green text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
              Get Started
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-b from-green-50 to-white py-16 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Simple, Transparent Pricing
        </h1>
        <p v-if="isFreeOnly" class="text-xl text-gray-600 max-w-3xl mx-auto">
          <span class="font-semibold text-farm-green">Free for {{ trialMonths }} months</span> while we are in testing —
          every feature, no limits, no payment details needed.
        </p>
        <p v-else class="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the right plan for your farm. No hidden fees, no surprises.
          Every plan starts with a {{ trialDays }}-day free trial.
        </p>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div
          class="grid gap-8 lg:gap-12"
          :class="plans.length > 1 ? 'md:grid-cols-3' : 'mx-auto max-w-md'"
        >
          <div
            v-for="plan in plans"
            :key="plan.slug"
            class="relative flex flex-col bg-white rounded-2xl shadow-lg p-8 border-2 transition-all"
            :class="isPopular(plan) ? 'border-farm-green shadow-2xl md:-mt-2' : 'border-gray-200 hover:border-farm-green'"
          >
            <span
              v-if="isPopular(plan)"
              class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-farm-green px-4 py-1 text-sm font-bold text-white whitespace-nowrap"
            >
              Most popular
            </span>

            <div class="mb-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
              <p v-if="plan.description" class="text-gray-600">{{ plan.description }}</p>
            </div>

            <div class="mb-6">
              <div v-if="Number(plan.price) === 0" class="flex items-baseline">
                <span class="text-5xl font-bold text-gray-900">Free</span>
                <span class="text-gray-600 ml-2">for {{ monthsFor(plan) }} months</span>
              </div>
              <div v-else class="flex items-baseline">
                <span class="text-5xl font-bold text-gray-900">
                  {{ plan.currency }} {{ Number(plan.price).toLocaleString('en-KE') }}
                </span>
                <span class="text-gray-600 ml-2">/{{ plan.interval === 'yearly' ? 'year' : 'month' }}</span>
              </div>
              <p v-if="Number(plan.price) > 0" class="text-sm text-gray-500 mt-1">
                {{ plan.trial_days }}-day free trial first
              </p>
            </div>

            <ul class="space-y-4 mb-8 flex-1">
              <li v-for="feature in plan.features" :key="feature" class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">{{ feature }}</span>
              </li>
            </ul>

            <p class="mb-4 border-t border-gray-100 pt-4 text-xs text-gray-400">{{ planLimitsLabel(plan) }}</p>

            <NuxtLink
              :to="`/register?plan=${plan.slug}`"
              class="block w-full text-center py-3 px-6 rounded-lg transition-colors font-semibold"
              :class="isPopular(plan) ? 'bg-farm-green text-white hover:bg-green-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'"
            >
              {{ Number(plan.price) === 0 ? 'Get started free' : 'Start free trial' }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Comparison Table — built from the live catalogue, so it stays
         truthful when plans are added, renamed or switched off. -->
    <section v-if="plans.length > 1" class="py-16 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">
          Compare All Features
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-gray-200">
                <th class="text-left py-4 px-6 text-gray-700 font-semibold">Feature</th>
                <th v-for="plan in plans" :key="plan.slug" class="text-center py-4 px-6 text-gray-700 font-semibold">
                  {{ plan.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in limitRows" :key="row.label" class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">{{ row.label }}</td>
                <td v-for="value in row.values" :key="value.slug" class="py-4 px-6 text-center text-gray-600">
                  {{ value.text }}
                </td>
              </tr>
              <tr v-for="feature in allFeatures" :key="feature" class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">{{ feature }}</td>
                <td v-for="plan in plans" :key="plan.slug" class="py-4 px-6 text-center">
                  <svg v-if="plan.features?.includes(feature)" class="w-5 h-5 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span v-else class="text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 px-4 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>

        <div class="space-y-6">
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              Is there a free trial?
            </h3>
            <p v-if="isFreeOnly" class="text-gray-600">
              Better than that — Farmconsul is completely free for {{ trialMonths }} months while we are
              in testing, with every feature unlocked and no limits. You do not need to enter any
              payment details to start.
            </p>
            <p v-else class="text-gray-600">
              Yes. Every plan starts with a {{ trialDays }}-day free trial with full access to all
              features, and you do not need to enter payment details to start.
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              What payment methods do you accept?
            </h3>
            <p class="text-gray-600">
              M-Pesa, bank transfer or cash. There is nothing to pay today — when the time comes you
              send the payment and our team confirms it and activates your plan.
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              What happens when my free period ends?
            </h3>
            <p class="text-gray-600">
              We will let you know well before it does. Your records are never deleted or locked
              away — you keep access to your data even if a payment is late.
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              Can I change plans later?
            </h3>
            <p class="text-gray-600">
              Yes. You can move between plans at any time from your billing page, and any time you
              have already paid for carries over.
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              Does it work without internet?
            </h3>
            <p class="text-gray-600">
              Yes. Record harvests, treatments, weights and sales out in the field with no network —
              everything syncs by itself the moment you are back online.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-4 bg-farm-green">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Farm Management?
        </h2>
        <p class="text-xl text-green-50 mb-8">
          Track crops, livestock, sales and money from your phone — even offline in the field.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/register"
            class="bg-white text-farm-green px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            {{ isFreeOnly ? 'Get started free' : 'Start free trial' }}
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg border-2 border-white"
          >
            Sign In
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <div class="mb-6">
          <div class="flex items-center justify-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-farm-green rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-white">Farmconsul</span>
          </div>
          <p class="text-gray-400">
            Empowering farmers with smart technology
          </p>
        </div>
        <div class="border-t border-gray-800 pt-8">
          <p>&copy; 2025 Farmconsul. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { BillingPlan } from '~/composables/useBilling'

// Live catalogue: the same source the register page uses, so pricing can never
// drift from what a farmer is actually signed up to.
const { plans, fetchPublicPlans } = usePublicPlans()

onMounted(fetchPublicPlans)

const monthsFor = (plan: BillingPlan) => Math.round((plan.trial_days ?? 180) / 30)

/** True while the only thing on offer is the free plan (the testing period). */
const isFreeOnly = computed(() =>
  plans.value.length === 1 && Number(plans.value[0]?.price ?? 0) === 0
)
const trialDays = computed(() => plans.value[0]?.trial_days ?? 14)
const trialMonths = computed(() => Math.round(trialDays.value / 30))

// Highlight the middle tier when there are several; nothing to highlight when
// there is only one plan.
const isPopular = (plan: BillingPlan) =>
  plans.value.length > 1 && plans.value[Math.floor(plans.value.length / 2)]?.slug === plan.slug

const formatLimit = (value: number | null | undefined) =>
  value ? value.toLocaleString('en-KE') : 'Unlimited'

const limitRows = computed(() => [
  { label: 'Farms', values: plans.value.map(p => ({ slug: p.slug, text: formatLimit(p.max_farms) })) },
  { label: 'Animals', values: plans.value.map(p => ({ slug: p.slug, text: formatLimit(p.max_animals) })) },
  { label: 'Team members', values: plans.value.map(p => ({ slug: p.slug, text: formatLimit(p.max_users) })) },
  { label: 'Free trial', values: plans.value.map(p => ({ slug: p.slug, text: `${p.trial_days} days` })) }
])

/** Every feature named by any plan, in the order they first appear. */
const allFeatures = computed(() => {
  const seen: string[] = []
  for (const plan of plans.value) {
    for (const feature of plan.features ?? []) {
      if (!seen.includes(feature)) seen.push(feature)
    }
  }
  return seen
})

const seoDescription = computed(() =>
  isFreeOnly.value
    ? `Farmconsul is free for ${trialMonths.value} months while we are in testing — track crops, livestock, sales and money, even offline.`
    : 'Simple KES pricing for every farm. Track crops, livestock, sales and money, even offline.'
)

useSeoMeta({
  title: 'Pricing — Farmconsul',
  description: seoDescription,
  ogTitle: 'Pricing — Farmconsul',
  ogDescription: seoDescription,
  ogUrl: 'https://farmconsul.com/pricing',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://farmconsul.com/pricing' }],
})
</script>
