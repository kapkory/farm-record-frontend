// Composable for offline detection and network status
import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { db } from '../utils/db'

export const useOffline = () => {
  const isOnline = ref(true)
  const lastOnline = ref<Date | null>(null)
  const pendingSyncCount = ref(0)

  // Check if we're in browser environment
  if (import.meta.client) {
    isOnline.value = navigator.onLine

    const updateOnlineStatus = () => {
      const newStatus = navigator.onLine
      const wasOffline = !isOnline.value
      
      isOnline.value = newStatus
      
      if (newStatus && wasOffline) {
        // Just came back online
        console.log('Back online! Syncing pending changes...')
        syncPendingChanges()
      } else if (!newStatus) {
        // Just went offline
        lastOnline.value = new Date()
        console.log('Gone offline. Changes will be queued for sync.')
      }
    }

    // Listen to online/offline events
    onMounted(() => {
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
    })

    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    })
  }

  // Sync pending changes when back online
  const syncPendingChanges = async () => {
    try {
      await db.init()
      const queue = await db.getSyncQueue()
      pendingSyncCount.value = queue.length

      if (queue.length === 0) return

      // Process each item in the queue
      for (const item of queue) {
        try {
          // Here you would call your actual API
          // Example: await $fetch('/api/' + item.entity, { method: item.action, body: item.data })
          
          console.log(`Syncing ${item.action} ${item.entity}:`, item.data)
          
          // Mark as synced
          await db.markSynced(item.id)
          pendingSyncCount.value--
        } catch (error) {
          console.error(`Failed to sync ${item.entity}:`, error)
          // Leave it in queue for next sync attempt
        }
      }

      // Clean up synced items
      await db.clearSyncedItems()
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  // Manual sync trigger
  const triggerSync = () => {
    if (isOnline.value) {
      syncPendingChanges()
    }
  }

  // Get pending sync count
  const updatePendingCount = async () => {
    try {
      await db.init()
      const queue = await db.getSyncQueue()
      pendingSyncCount.value = queue.length
    } catch (error) {
      console.error('Error getting pending count:', error)
    }
  }

  // Check on mount
  if (import.meta.client) {
    onMounted(() => {
      updatePendingCount()
      // Auto-sync if online
      if (isOnline.value) {
        syncPendingChanges()
      }
    })
  }

  return {
    isOnline: readonly(isOnline),
    lastOnline: readonly(lastOnline),
    pendingSyncCount: readonly(pendingSyncCount),
    triggerSync,
    updatePendingCount
  }
}
