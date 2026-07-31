<template>
  <div class="min-h-screen farm-bg farm-pattern">
    <!-- Top bar -->
    <header class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
      <NuxtLink to="/" class="flex items-center space-x-2">
        <div class="w-9 h-9 bg-farm-green rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <span class="text-xl font-bold text-gray-900">FarmConsul</span>
      </NuxtLink>
      <div class="flex items-center gap-3">
        <NuxtLink to="/login" class="text-sm font-semibold text-gray-600 hover:text-gray-900">Sign in</NuxtLink>
        <NuxtLink to="/register" class="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors">
          Get started
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-4 pb-16">
      <!-- Hero -->
      <div class="text-center py-8 lg:py-12">
        <h1 class="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
          Simple plans for every <span class="text-farm-green">farm</span>
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Every plan starts with a <span class="font-semibold text-farm-green">14-day free trial</span>.
          No payment needed today — pay later by M-Pesa, bank or cash and our team activates your plan.
        </p>
      </div>

      <!-- Plan cards -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
        <div
          v-for="plan in plans"
          :key="plan.slug"
          class="relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm"
          :class="plan.slug === 'professional' ? 'border-green-500 shadow-xl md:-mt-3 md:mb-3' : 'border-gray-200'"
        >
          <span
            v-if="plan.slug === 'professional'"
            class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-farm-green px-3 py-1 text-xs font-bold uppercase tracking-wide text-white whitespace-nowrap"
          >
            Most popular
          </span>

          <h2 class="text-xl font-bold text-gray-900">{{ plan.name }}</h2>
          <p v-if="plan.description" class="mt-1 text-sm text-gray-500">{{ plan.description }}</p>

          <p class="mt-4 text-4xl font-bold text-gray-900">
            KES {{ Number(plan.price).toLocaleString('en-KE') }}
            <span class="text-base font-medium text-gray-500">/{{ plan.interval === 'yearly' ? 'year' : 'month' }}</span>
          </p>

          <ul class="mt-6 space-y-3 flex-1">
            <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2.5 text-sm text-gray-700">
              <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg class="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
              {{ feature }}
            </li>
          </ul>

          <p class="mt-5 border-t border-gray-100 pt-3 text-xs text-gray-400">{{ planLimitsLabel(plan) }}</p>

          <NuxtLink
            :to="`/register?plan=${plan.slug}`"
            class="mt-4 w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors"
            :class="plan.slug === 'professional' ? 'bg-green-500 text-white hover:bg-green-600' : 'border-2 border-green-500 text-green-600 hover:bg-green-50'"
          >
            Start {{ plan.trial_days }}-day free trial
          </NuxtLink>
        </div>
      </div>

      <!-- Reassurance -->
      <div class="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3 text-center">
        <div>
          <p class="text-sm font-semibold text-gray-900">No card required</p>
          <p class="mt-1 text-sm text-gray-500">Try everything free for 14 days before paying anything.</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-900">Pay how you like</p>
          <p class="mt-1 text-sm text-gray-500">M-Pesa, bank or cash — our team confirms and activates your plan.</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-900">Your records are safe</p>
          <p class="mt-1 text-sm text-gray-500">If a payment is late you are never locked out of your data.</p>
        </div>
      </div>

      <div class="mt-12 text-center">
        <p class="text-gray-600">
          Already have an account?
          <NuxtLink to="/login" class="font-semibold text-green-600 hover:text-green-700">Sign in here</NuxtLink>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { plans, fetchPublicPlans } = usePublicPlans()

onMounted(fetchPublicPlans)

useSeoMeta({
  title: 'Plans & Pricing — Farmconsul',
  description: 'Simple KES plans for every farm. Start a 14-day free trial — track crops, livestock, sales and money, even offline.',
  ogTitle: 'Plans & Pricing — Farmconsul',
  ogDescription: 'Simple KES plans for every farm. Start a 14-day free trial — track crops, livestock, sales and money, even offline.',
  ogUrl: 'https://farmconsul.com/plans',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://farmconsul.com/plans' }],
})
</script>
