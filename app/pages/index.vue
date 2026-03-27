<template>
  <div class="min-h-screen bg-white">

    <!-- PWA Install Banner -->
    <div v-if="showInstallBanner" class="bg-green-600 text-white px-4 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </div>
          <p class="text-sm sm:text-base font-medium truncate">Install Farmconsul on your phone for quick access — works even without internet!</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button @click="installPwa" class="bg-white text-green-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-green-50 transition-colors shadow-sm">
            Install App
          </button>
          <button @click="dismissInstallBanner" class="text-white/70 hover:text-white p-1" aria-label="Dismiss">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">Farmconsul</span>
          </div>
          <div class="flex items-center space-x-3">
            <NuxtLink to="/login" class="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Login
            </NuxtLink>
            <NuxtLink to="/register" class="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 font-semibold transition-colors shadow-sm">
              Get Started Free
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-4">
      <div class="max-w-6xl mx-auto text-center">
        <span class="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          🌱 Built for Farmers Across Africa
        </span>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Your Whole Farm,<br/>
          <span class="text-green-500">Right in Your Pocket</span>
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Whether you grow maize in Kenya, cocoa in Ghana, or keep cattle in Nigeria — Farmconsul helps you record everything, track your workers, and never forget a harvest. Even without airtime or Wi-Fi.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/register"
            class="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-md transition-colors">
            Start for Free →
          </NuxtLink>
          <button v-if="canInstall" @click="installPwa"
            class="border-2 border-green-500 text-green-600 hover:bg-green-50 text-lg font-semibold px-10 py-4 rounded-xl transition-colors">
            📲 Install the App
          </button>
          <NuxtLink v-else to="/login"
            class="border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 text-lg font-semibold px-10 py-4 rounded-xl transition-colors">
            I already have an account
          </NuxtLink>
        </div>
        <p class="mt-5 text-sm text-gray-400">No credit card · Works offline · Free to start · Install on your phone</p>
      </div>

      <!-- Trust signals -->
      <div class="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm text-center border border-gray-100">
          <p class="text-3xl font-bold text-green-500">📴</p>
          <p class="text-sm text-gray-600 mt-1 font-medium">Works Without Network</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm text-center border border-gray-100">
          <p class="text-3xl font-bold text-green-500">Free</p>
          <p class="text-sm text-gray-600 mt-1 font-medium">No Hidden Charges</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm text-center border border-gray-100">
          <p class="text-3xl font-bold text-green-500">👨‍🌾</p>
          <p class="text-sm text-gray-600 mt-1 font-medium">Made for Farmers</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm text-center border border-gray-100">
          <p class="text-3xl font-bold text-green-500">📱</p>
          <p class="text-sm text-gray-600 mt-1 font-medium">Any Phone Works</p>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="py-20 px-4 bg-white">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">Start in 3 easy steps</h2>
          <p class="text-gray-500 mt-3 text-lg">No training, no manual, no confusion. Just open and begin.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">1</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Register Your Farm</h3>
            <p class="text-gray-500">Give your farm a name, pick the location and size. Whether it's a small plot or a big ranch — it all works.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">2</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Record What You Grow & Keep</h3>
            <p class="text-gray-500">Add your crops, plantings, and animals. Write down what you planted, where, and when — so nothing is forgotten.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-md">3</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Give Tasks & Track Harvests</h3>
            <p class="text-gray-500">Tell your workers what to do, see who did what, and record every harvest. Your farm book — but smarter.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-4 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">Everything you need to run your farm well</h2>
          <p class="text-gray-500 mt-3 text-lg">Simple tools that solve real problems farmers face every day</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- Farms -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Manage Your Farms & Fields</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Got one shamba or five? Register them all. See every field, what is planted, and how your land is being used — all in one place.</p>
          </div>

          <!-- Plantings -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Track Every Planting</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Record what you planted, the variety, which field, and the date. No more forgetting when you put your maize or beans in the ground.</p>
          </div>

          <!-- Tasks -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Assign Work to Your Team</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Create tasks like “Spray tomatoes on Friday” and assign them to a worker. See what is done, what is pending, and what is overdue.</p>
          </div>

          <!-- Treatments -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Spraying & Treatment Records</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Wrote down what chemical you sprayed and when? Now it is digital. Keep a proper record for every fertiliser, pesticide, or fungicide you apply.</p>
          </div>

          <!-- Harvests -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Record Your Harvests</h3>
            <p class="text-gray-500 text-sm leading-relaxed">How many bags of maize did you get this season? Log every harvest so you can compare seasons and know which fields perform best.</p>
          </div>

          <!-- Offline / PWA -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 17.657a9 9 0 010-12.728M9.172 14.828a5 5 0 010-7.072M12 12h.01"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Network? No Problem</h3>
            <p class="text-gray-500 text-sm leading-relaxed">We know many farms in Africa have poor network. Farmconsul saves everything on your phone first and sends it to the cloud when you get signal.</p>
          </div>

          <!-- Personnel -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Manage Your Workers</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Add every worker and manager on the farm. Know who is responsible for what — from the tractor driver to the supervisor.</p>
          </div>

          <!-- Livestock -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Keep Track of Your Animals</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Cows, goats, chickens — track them all. Count your livestock on each farm and manage crops and animals side by side.</p>
          </div>

          <!-- Inventory -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Farm Inputs & Stock</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Seeds, fertiliser, feeds, chemicals — know what you have and when you are running low. Stop mid-season surprises.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- Offline-first highlight -->
    <section class="py-20 px-4 bg-green-600 text-white">
      <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div class="flex-1 text-center md:text-left">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            Your farm records stay safe — even in the bush with no signal
          </h2>
          <p class="text-green-100 text-lg leading-relaxed mb-6">
            We built Farmconsul for the reality of African farming. Power cuts, poor networks, no Wi-Fi — it does not matter. Your data is stored right on your phone and syncs to the cloud when you next get online. Nothing is ever lost.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink to="/register" class="inline-block bg-white text-green-600 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-md text-center">
              Get Started Free
            </NuxtLink>
            <button v-if="canInstall" @click="installPwa" class="inline-block border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-center">
              📲 Install on Your Phone
            </button>
          </div>
        </div>
        <div class="flex-shrink-0 w-48 h-48 bg-green-500 rounded-3xl flex items-center justify-center shadow-xl">
          <svg class="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- Install App Section -->
    <section class="py-16 px-4 bg-gray-900 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4">Install Farmconsul Like a Real App</h2>
        <p class="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
          No app store needed. Just tap the button below and Farmconsul is added to your home screen — opens instantly like WhatsApp or M-Pesa. Uses almost no storage.
        </p>
        <div class="grid sm:grid-cols-3 gap-6 mb-10">
          <div class="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <p class="text-3xl mb-3">📥</p>
            <h3 class="font-semibold text-lg mb-1">Tap Install</h3>
            <p class="text-gray-400 text-sm">Press the install button below or use your browser menu</p>
          </div>
          <div class="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <p class="text-3xl mb-3">🏠</p>
            <h3 class="font-semibold text-lg mb-1">Opens from Home Screen</h3>
            <p class="text-gray-400 text-sm">Farmconsul icon appears on your phone — tap it to open directly</p>
          </div>
          <div class="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <p class="text-3xl mb-3">⚡</p>
            <h3 class="font-semibold text-lg mb-1">Fast &amp; Offline Ready</h3>
            <p class="text-gray-400 text-sm">Loads instantly, works without internet, uses very little data</p>
          </div>
        </div>
        <button v-if="canInstall" @click="installPwa" class="bg-green-500 hover:bg-green-600 text-white text-xl font-bold px-12 py-5 rounded-2xl shadow-lg transition-colors">
          📲 Install Farmconsul Now
        </button>
        <NuxtLink v-else to="/register" class="inline-block bg-green-500 hover:bg-green-600 text-white text-xl font-bold px-12 py-5 rounded-2xl shadow-lg transition-colors">
          Create Your Free Account →
        </NuxtLink>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 bg-white text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your farm deserves better than a notebook</h2>
        <p class="text-gray-500 text-lg mb-10">Join thousands of farmers across Africa who are using Farmconsul to save time, reduce losses, and grow smarter every season.</p>
        <NuxtLink to="/register"
          class="inline-block bg-green-500 hover:bg-green-600 text-white text-xl font-bold px-12 py-5 rounded-2xl shadow-lg transition-colors">
          Start Managing Your Farm →
        </NuxtLink>
        <p class="mt-6 text-sm text-gray-400">Free to start · Works on any phone · No experience needed</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-10 px-4">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <span class="text-white font-semibold">Farmconsul</span>
        </div>
        <p class="text-sm">© {{ new Date().getFullYear() }} Farmconsul. Built for African farmers.</p>
        <div class="flex gap-5 text-sm">
          <NuxtLink to="/login" class="hover:text-white transition-colors">Login</NuxtLink>
          <NuxtLink to="/register" class="hover:text-white transition-colors">Register</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-white transition-colors">Pricing</NuxtLink>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
const deferredPrompt = ref(null)
const showInstallBanner = ref(false)
const canInstall = computed(() => !!deferredPrompt.value)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showInstallBanner.value = true
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    showInstallBanner.value = false
  })
})

const installPwa = async () => {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    deferredPrompt.value = null
    showInstallBanner.value = false
  }
}

const dismissInstallBanner = () => {
  showInstallBanner.value = false
}

useHead({
  title: 'Farmconsul — Smart Farm Management for African Farmers',
  meta: [
    { name: 'description', content: 'Track crops, manage workers, record harvests and tasks — all from your phone. Works offline. Built for farmers across Africa.' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Farmconsul' }
  ]
})
</script>