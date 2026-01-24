<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Crop Settings</h1>

    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="mt-4">
      <CropTypeTab v-if="activeTab === 'type'" />
      <CropVarietyTab v-if="activeTab === 'variety'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'admin'
})

const tabs = [
  { id: 'type', label: 'Crop Types' },
  { id: 'variety', label: 'Crop Varieties' }
]

const activeTab = ref('type')
</script>