<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
      <p class="text-sm text-gray-500 mt-1">Manage system-wide configuration and lookup data.</p>
    </div>

    <!-- Money categories moved to their own section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900">Money Categories</h2>
      <p class="text-sm text-gray-500 mt-0.5">
        Income and expense categories now have their own section.
      </p>
      <NuxtLink
        to="/admin/settings/accounts"
        class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
      >
        Open Money Categories
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})
</script>
