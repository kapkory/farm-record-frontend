// Composable for managing offline-first data operations
import { ref } from 'vue'
import { db, type Farm, type Breeding, type SyncQueue } from '../utils/db'

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

  // Breeding operations
  const saveBreeding = async (breeding: Partial<Breeding> & { animal_uuid: string }) => {
    const breedingData: Breeding = {
      id: breeding.id || crypto.randomUUID(),
      animal_uuid: breeding.animal_uuid,
      farm_id: breeding.farm_id ?? null,
      dam_id: breeding.dam_id ?? null,
      sire_id: breeding.sire_id ?? null,
      sire_type: breeding.sire_type || 'natural',
      service_date: breeding.service_date || new Date().toISOString().split('T')[0],
      expected_birth_date: breeding.expected_birth_date ?? null,
      status: breeding.status || 'pending',
      ai_straw_code: breeding.ai_straw_code ?? null,
      ai_bull_name: breeding.ai_bull_name ?? null,
      ai_technician: breeding.ai_technician ?? null,
      notes: breeding.notes ?? null,
      synced: false,
      createdAt: breeding.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      await db.addBreeding(breedingData)

      const syncItem: SyncQueue = {
        id: crypto.randomUUID(),
        action: breeding.id ? 'update' : 'create',
        entity: 'breeding',
        data: { ...breedingData, _localId: breedingData.id },
        timestamp: Date.now(),
        synced: false
      }
      await db.addToSyncQueue(syncItem)

      if (isOnline.value) {
        try {
          console.log('Breeding saved online:', breedingData)
          breedingData.synced = true
          await db.addBreeding(breedingData)
          await db.markSynced(syncItem.id)
        } catch (error) {
          console.error('Failed to sync breeding online, will retry later:', error)
        }
      }

      return breedingData
    } catch (error) {
      console.error('Error saving breeding:', error)
      throw error
    }
  }

  const getBreedings = async (animalUuid: string): Promise<Breeding[]> => {
    try {
      const breedings = await db.getBreedingsByAnimal(animalUuid)

      if (isOnline.value) {
        try {
          console.log('Getting breedings from local DB (would fetch from API if connected)')
        } catch (error) {
          console.error('Failed to fetch breedings from API, using local data:', error)
        }
      }

      return breedings
    } catch (error) {
      console.error('Error getting breedings:', error)
      return []
    }
  }

  const deleteBreeding = async (id: string) => {
    try {
      const syncItem: SyncQueue = {
        id: crypto.randomUUID(),
        action: 'delete',
        entity: 'breeding',
        data: { uuid: id },
        timestamp: Date.now(),
        synced: false
      }
      await db.addToSyncQueue(syncItem)
      await db.deleteBreeding(id)

      if (isOnline.value) {
        try {
          console.log('Breeding deleted online:', id)
          await db.markSynced(syncItem.id)
        } catch (error) {
          console.error('Failed to delete breeding online, will retry later:', error)
        }
      }
    } catch (error) {
      console.error('Error deleting breeding:', error)
      throw error
    }
  }

  return {
    saveFarm,
    getFarms,
    deleteFarm,
    saveBreeding,
    getBreedings,
    deleteBreeding,
    cacheData,
    getCachedData
  }
}
