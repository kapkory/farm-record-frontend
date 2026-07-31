<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Money Categories</h1>
      <p class="text-sm text-gray-500 mt-1">
        The categories used when you record money in and money out — for example
        "Milk, Eggs &amp; Honey Sales" or "Animal Feed". Most farms never need to
        change these; add a category only when nothing on the list fits.
      </p>
    </div>

    <LedgerAccount />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

useHead({
  title: 'Money Categories — Farmconsul'
})
</script>
