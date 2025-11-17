// Composable for managing offline-first data operations
import { ref } from 'vue'
import { db, type Farm, type SyncQueue } from '../utils/db'

export const useOfflineData = () => {
  const { isOnline } = useOffline()

  // Farms operations
  const saveFarm = async (farm: Partial<Farm>) => {
    const farmData: Farm = {
      id: farm.id || crypto.randomUUID(),
      name: farm.name || '',
      location: farm.location || '',
      size: farm.size || '',
      type: farm.type || '',
      owner: farm.owner || '',
      status: farm.status || 'active',
      createdAt: farm.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false
    }

    try {
      // Save to IndexedDB first
      await db.addFarm(farmData)

      // Add to sync queue
      const syncItem: SyncQueue = {
        id: crypto.randomUUID(),
        action: farm.id ? 'update' : 'create',
        entity: 'farm',
        data: farmData,
        timestamp: Date.now(),
        synced: false
      }
      await db.addToSyncQueue(syncItem)

      // If online, try to sync immediately
      if (isOnline.value) {
        try {
          // Here you would call your actual API
          // const response = await $fetch('/api/farms', { 
          //   method: 'POST', 
          //   body: farmData 
          // })
          
          console.log('Farm saved online:', farmData)
          
          // Mark as synced
          farmData.synced = true
          await db.addFarm(farmData)
          await db.markSynced(syncItem.id)
        } catch (error) {
          console.error('Failed to sync farm online, will retry later:', error)
        }
      }

      return farmData
    } catch (error) {
      console.error('Error saving farm:', error)
      throw error
    }
  }

  const getFarms = async (): Promise<Farm[]> => {
    try {
      // Always get from local DB first
      const farms = await db.getAllFarms()

      // If online, try to fetch fresh data
      if (isOnline.value) {
        try {
          // Here you would call your actual API
          // const freshFarms = await $fetch('/api/farms')
          // 
          // // Update local DB with fresh data
          // for (const farm of freshFarms) {
          //   await db.addFarm({ ...farm, synced: true })
          // }
          // 
          // return freshFarms
          
          console.log('Getting farms from local DB (would fetch from API if connected)')
        } catch (error) {
          console.error('Failed to fetch farms from API, using local data:', error)
        }
      }

      return farms
    } catch (error) {
      console.error('Error getting farms:', error)
      return []
    }
  }

  const deleteFarm = async (id: string) => {
    try {
      // Add to sync queue first
      const syncItem: SyncQueue = {
        id: crypto.randomUUID(),
        action: 'delete',
        entity: 'farm',
        data: { id },
        timestamp: Date.now(),
        synced: false
      }
      await db.addToSyncQueue(syncItem)

      // Delete from local DB
      await db.deleteFarm(id)

      // If online, try to sync immediately
      if (isOnline.value) {
        try {
          // Here you would call your actual API
          // await $fetch(`/api/farms/${id}`, { method: 'DELETE' })
          
          console.log('Farm deleted online:', id)
          await db.markSynced(syncItem.id)
        } catch (error) {
          console.error('Failed to delete farm online, will retry later:', error)
        }
      }
    } catch (error) {
      console.error('Error deleting farm:', error)
      throw error
    }
  }

  // Cache operations with TTL
  const cacheData = async (key: string, data: any, ttlSeconds: number = 3600) => {
    try {
      await db.setCache(key, data, ttlSeconds * 1000)
    } catch (error) {
      console.error('Error caching data:', error)
    }
  }

  const getCachedData = async (key: string) => {
    try {
      return await db.getCache(key)
    } catch (error) {
      console.error('Error getting cached data:', error)
      return null
    }
  }

  return {
    saveFarm,
    getFarms,
    deleteFarm,
    cacheData,
    getCachedData
  }
}
