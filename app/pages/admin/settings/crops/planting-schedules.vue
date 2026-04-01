<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Planting Schedules</h1>
    <p class="text-gray-600 mb-6">
      Define reusable activity schedules for your crops. When you create a new planting and select a schedule, 
      tasks will be automatically generated based on the planting date.
    </p>
    <PlantingScheduleTab />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})
</script>
