<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
      <p class="text-sm text-gray-500 mt-1">Manage system-wide configuration and lookup data.</p>
    </div>

    <!-- Transaction Categories -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Transaction Categories</h2>
        <p class="text-sm text-gray-500 mt-0.5">Define income and expense categories used across the farm.</p>
      </div>
      <div class="p-6">
        <LedgerAccount />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})
</script>
