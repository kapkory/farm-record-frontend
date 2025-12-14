<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Users Management</h1>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div class="flex justify-center mb-4">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Users Management</h2>
      <p class="text-gray-600">This page is under development. User management features coming soon.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

useHead({
  title: 'Users Management - FarmConsul Admin'
})
</script>
