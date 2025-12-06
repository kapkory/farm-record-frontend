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
              <h1 class="text-xl font-bold text-gray-900">FarmManage Pro</h1>
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
        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Choose the perfect plan for your farm. No hidden fees, no surprises. 
          All plans include a 14-day free trial.
        </p>
        
        <!-- Billing Toggle -->
        <div class="flex items-center justify-center space-x-4 mb-12">
          <span class="text-gray-700 font-medium" :class="{ 'text-farm-green': !isAnnual }">
            Monthly
          </span>
          <button 
            @click="isAnnual = !isAnnual"
            class="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-farm-green focus:ring-offset-2"
            :class="isAnnual ? 'bg-farm-green' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
              :class="isAnnual ? 'translate-x-9' : 'translate-x-1'"
            />
          </button>
          <span class="text-gray-700 font-medium" :class="{ 'text-farm-green': isAnnual }">
            Annual
            <span class="text-sm text-green-600 font-semibold ml-1">(Save 20%)</span>
          </span>
        </div>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
          
          <!-- Starter Plan -->
          <div class="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-farm-green transition-all">
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p class="text-gray-600">Perfect for small farms</p>
            </div>
            
            <div class="mb-6">
              <div class="flex items-baseline">
                <span class="text-5xl font-bold text-gray-900">
                  ${{ isAnnual ? '19' : '29' }}
                </span>
                <span class="text-gray-600 ml-2">/month</span>
              </div>
              <p v-if="isAnnual" class="text-sm text-gray-500 mt-1">
                Billed annually ($228/year)
              </p>
            </div>

            <ul class="space-y-4 mb-8">
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Up to 50 acres</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Up to 100 livestock</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Basic crop tracking</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Weather forecasts</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Mobile app access</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Email support</span>
              </li>
            </ul>

            <NuxtLink 
              to="/register" 
              class="block w-full text-center bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Start Free Trial
            </NuxtLink>
          </div>

          <!-- Professional Plan (Most Popular) -->
          <div class="bg-white rounded-2xl shadow-2xl p-8 border-2 border-farm-green relative transform md:scale-105">
            <div class="absolute -top-5 left-1/2 transform -translate-x-1/2">
              <span class="bg-farm-green text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <p class="text-gray-600">For growing operations</p>
            </div>
            
            <div class="mb-6">
              <div class="flex items-baseline">
                <span class="text-5xl font-bold text-gray-900">
                  ${{ isAnnual ? '39' : '49' }}
                </span>
                <span class="text-gray-600 ml-2">/month</span>
              </div>
              <p v-if="isAnnual" class="text-sm text-gray-500 mt-1">
                Billed annually ($468/year)
              </p>
            </div>

            <ul class="space-y-4 mb-8">
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Up to 500 acres</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Unlimited livestock</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Advanced crop management</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Financial tracking & reports</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Equipment maintenance tracking</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Priority support</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">API access</span>
              </li>
            </ul>

            <NuxtLink 
              to="/register" 
              class="block w-full text-center bg-farm-green text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Start Free Trial
            </NuxtLink>
          </div>

          <!-- Enterprise Plan -->
          <div class="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-farm-green transition-all">
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p class="text-gray-600">For large-scale farms</p>
            </div>
            
            <div class="mb-6">
              <div class="flex items-baseline">
                <span class="text-5xl font-bold text-gray-900">
                  ${{ isAnnual ? '79' : '99' }}
                </span>
                <span class="text-gray-600 ml-2">/month</span>
              </div>
              <p v-if="isAnnual" class="text-sm text-gray-500 mt-1">
                Billed annually ($948/year)
              </p>
            </div>

            <ul class="space-y-4 mb-8">
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Unlimited acres</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Unlimited livestock</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Multi-location support</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Advanced analytics & AI insights</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Team management (unlimited users)</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Custom integrations</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">Dedicated account manager</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-farm-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="ml-3 text-gray-700">24/7 phone support</span>
              </li>
            </ul>

            <NuxtLink 
              to="/register" 
              class="block w-full text-center bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Start Free Trial
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Comparison Table -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">
          Compare All Features
        </h2>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-gray-200">
                <th class="text-left py-4 px-6 text-gray-700 font-semibold">Feature</th>
                <th class="text-center py-4 px-6 text-gray-700 font-semibold">Starter</th>
                <th class="text-center py-4 px-6 text-gray-700 font-semibold">Professional</th>
                <th class="text-center py-4 px-6 text-gray-700 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">Farm Size</td>
                <td class="py-4 px-6 text-center text-gray-600">50 acres</td>
                <td class="py-4 px-6 text-center text-gray-600">500 acres</td>
                <td class="py-4 px-6 text-center text-gray-600">Unlimited</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">Livestock Tracking</td>
                <td class="py-4 px-6 text-center text-gray-600">100 animals</td>
                <td class="py-4 px-6 text-center text-gray-600">Unlimited</td>
                <td class="py-4 px-6 text-center text-gray-600">Unlimited</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">Crop Management</td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">Financial Tracking</td>
                <td class="py-4 px-6 text-center">
                  <span class="text-gray-400">—</span>
                </td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">Weather Forecasts</td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">API Access</td>
                <td class="py-4 px-6 text-center">
                  <span class="text-gray-400">—</span>
                </td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
                <td class="py-4 px-6 text-center">
                  <svg class="w-6 h-6 text-farm-green mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">Team Management</td>
                <td class="py-4 px-6 text-center">
                  <span class="text-gray-400">—</span>
                </td>
                <td class="py-4 px-6 text-center text-gray-600">Up to 5 users</td>
                <td class="py-4 px-6 text-center text-gray-600">Unlimited</td>
              </tr>
              <tr class="border-b border-gray-100">
                <td class="py-4 px-6 text-gray-700">Support</td>
                <td class="py-4 px-6 text-center text-gray-600">Email</td>
                <td class="py-4 px-6 text-center text-gray-600">Priority</td>
                <td class="py-4 px-6 text-center text-gray-600">24/7 Phone</td>
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
              Can I change plans later?
            </h3>
            <p class="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and we'll prorate any billing differences.
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              Is there a free trial?
            </h3>
            <p class="text-gray-600">
              All plans include a 14-day free trial with full access to all features. 
              No credit card required to start your trial.
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              What happens to my data if I cancel?
            </h3>
            <p class="text-gray-600">
              Your data is always yours. You can export all your data at any time, and we keep it 
              for 90 days after cancellation in case you want to return.
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              Do you offer discounts for non-profits?
            </h3>
            <p class="text-gray-600">
              Yes! We offer special pricing for educational institutions, non-profits, and agricultural 
              cooperatives. Contact our sales team for more information.
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              What payment methods do you accept?
            </h3>
            <p class="text-gray-600">
              We accept all major credit cards, debit cards, and ACH bank transfers for annual plans. 
              All payments are processed securely through Stripe.
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
          Join thousands of farmers who are already using FarmManage Pro to optimize their operations.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/register" 
            class="bg-white text-farm-green px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Start Free Trial
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
            <span class="text-xl font-bold text-white">FarmManage Pro</span>
          </div>
          <p class="text-gray-400">
            Empowering farmers with smart technology
          </p>
        </div>
        <div class="border-t border-gray-800 pt-8">
          <p>&copy; 2025 FarmManage Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isAnnual = ref(false)

// SEO Meta
useHead({
  title: 'Pricing - FarmManage Pro',
  meta: [
    { name: 'description', content: 'Choose the perfect plan for your farm. Simple, transparent pricing with no hidden fees. All plans include a 14-day free trial.' }
  ]
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
