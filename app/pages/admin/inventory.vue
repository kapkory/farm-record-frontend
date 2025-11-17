<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Inventory Management</h1>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div class="flex justify-center mb-4">
        <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h2>
      <p class="text-gray-600">This page is under development. Inventory tracking features coming soon.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Inventory Management - FarmManage Pro Admin'
})
</script>
