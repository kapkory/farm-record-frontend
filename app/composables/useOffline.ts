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

      // Get $apiFetch from Nuxt app (may not be available during SSR)
      let apiFetch: any = null
      try {
        const nuxtApp = useNuxtApp()
        apiFetch = nuxtApp.$apiFetch
      } catch {
        // Not in Nuxt context — skip API sync
        console.warn('Sync skipped: Nuxt app context unavailable')
        return
      }

      // Process each item in the queue
      for (const item of queue) {
        try {
          const endpoint = getSyncEndpoint(item)
          if (!endpoint) {
            console.warn(`No sync endpoint for entity "${item.entity}" action "${item.action}", skipping`)
            await db.markSynced(item.id)
            pendingSyncCount.value--
            continue
          }

          await apiFetch('/sanctum/csrf-cookie')
          await apiFetch(endpoint.url, {
            method: endpoint.method,
            ...(endpoint.body ? { body: endpoint.body } : {})
          })

          // Mark as synced
          await db.markSynced(item.id)

          // If the entity has a local record, mark it synced in its store
          if (item.entity === 'breeding' && item.data?._localId) {
            const existing = await db.getBreeding(item.data._localId)
            if (existing) {
              await db.addBreeding({ ...existing, synced: true })
            }
          }

          pendingSyncCount.value--
        } catch (error: any) {
          const status = error?.response?.status || error?.status
          if (status === 404 || status === 422) {
            // Unrecoverable — remove from queue
            console.error(`Sync failed (${status}) for ${item.entity}, removing from queue:`, error)
            await db.markSynced(item.id)
            pendingSyncCount.value--
          } else {
            // Transient error — leave in queue for retry
            console.error(`Failed to sync ${item.entity}, will retry:`, error)
          }
        }
      }

      // Clean up synced items
      await db.clearSyncedItems()
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  // Route sync queue items to the correct API endpoint
  const getSyncEndpoint = (item: { entity: string; action: string; data: any }): { url: string; method: string; body?: any } | null => {
    const { entity, action, data } = item

    switch (entity) {
      case 'breeding': {
        if (action === 'create') {
          const { _localId, ...payload } = data
          return { url: '/api/v1/farms/farm/animals/breedings', method: 'POST', body: payload }
        }
        if (action === 'update') {
          const { uuid, ...payload } = data
          return { url: `/api/v1/farms/farm/animals/breedings/${uuid}`, method: 'PUT', body: payload }
        }
        if (action === 'delete') {
          return { url: `/api/v1/farms/farm/animals/breedings/${data.uuid}`, method: 'DELETE' }
        }
        return null
      }

      case 'farm': {
        if (action === 'create' || action === 'update') {
          return { url: '/api/v1/farms', method: action === 'create' ? 'POST' : 'PUT', body: data }
        }
        if (action === 'delete') {
          return { url: `/api/v1/farms/${data.id}`, method: 'DELETE' }
        }
        return null
      }

      default:
        // Other entities can be added here following the same pattern
        console.log(`Sync entity "${entity}" not yet routed — skipping`)
        return null
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
