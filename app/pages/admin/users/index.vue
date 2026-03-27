<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Users</h1>
      <p class="mt-1 text-sm text-gray-500">Manage farm system users and personnel who work on the farm but do not need login access.</p>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-4 py-3 sm:px-6">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            @click="activeTab = tab.value"
            :class="[
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="p-6">
        <FarmUsersSection v-if="activeTab === 'farm-users'" />
        <PersonnelsSection v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

useHead({
  title: 'Users Management - FarmConsul Admin'
})

type ActiveTab = 'farm-users' | 'personnels'

const tabs: Array<{ value: ActiveTab; label: string }> = [
  { value: 'farm-users', label: 'Farm Users' },
  { value: 'personnels', label: 'Personnels' }
]

const activeTab = ref<ActiveTab>('farm-users')
</script>
