<template>
  <Transition name="slide-down">
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
    >
      <div class="flex items-center justify-center space-x-2">
        <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"/>
        </svg>
        <span>You're offline. Changes will be saved locally and synced when you're back online.</span>
        <span v-if="pendingSyncCount > 0" class="ml-2 px-2 py-1 bg-yellow-600 rounded-full text-xs">
          {{ pendingSyncCount }} pending
        </span>
      </div>
    </div>
  </Transition>

  <Transition name="slide-down">
    <div
      v-if="showSyncSuccess"
      class="fixed top-0 left-0 right-0 z-[100] bg-green-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
    >
      <div class="flex items-center justify-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Back online! All changes synced successfully.</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const { isOnline, pendingSyncCount } = useOffline()
const showSyncSuccess = ref(false)
let syncTimer: ReturnType<typeof setTimeout> | null = null

// Watch for online status changes
watch(isOnline, (newStatus, oldStatus) => {
  if (newStatus && !oldStatus) {
    // Just came back online
    showSyncSuccess.value = true
    
    // Hide success message after 3 seconds
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      showSyncSuccess.value = false
    }, 3000)
  }
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
