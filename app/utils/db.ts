// IndexedDB wrapper for offline-first data storage

const DB_NAME = 'FarmManageDB'
const DB_VERSION = 2

export interface Farm {
  id: string
  name: string
  location: string
  size: string
  type: string
  owner: string
  status: string
  createdAt: string
  updatedAt: string
  synced: boolean
}

export interface Breeding {
  id: string
  animal_uuid: string
  farm_id: number | string | null
  dam_id: number | string | null
  sire_id: number | string | null
  sire_type: 'natural' | 'ai' | 'embryo'
  service_date: string
  expected_birth_date: string | null
  status: 'pending' | 'born' | 'aborted' | 'failed'
  ai_straw_code: string | null
  ai_bull_name: string | null
  ai_technician: string | null
  notes: string | null
  synced: boolean
  createdAt: string
  updatedAt: string
}

export interface SyncQueue {
  id: string
  action: 'create' | 'update' | 'delete'
  entity: 'farm' | 'crop' | 'livestock' | 'inventory' | 'breeding'
  data: any
  timestamp: number
  synced: boolean
}

class FarmManageDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Farms store
        if (!db.objectStoreNames.contains('farms')) {
          const farmStore = db.createObjectStore('farms', { keyPath: 'id' })
          farmStore.createIndex('name', 'name', { unique: false })
          farmStore.createIndex('type', 'type', { unique: false })
          farmStore.createIndex('synced', 'synced', { unique: false })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncStore.createIndex('synced', 'synced', { unique: false })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Offline cache store
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }

        // Breedings store (added in v2)
        if (!db.objectStoreNames.contains('breedings')) {
          const breedingStore = db.createObjectStore('breedings', { keyPath: 'id' })
          breedingStore.createIndex('animal_uuid', 'animal_uuid', { unique: false })
          breedingStore.createIndex('farm_id', 'farm_id', { unique: false })
          breedingStore.createIndex('status', 'status', { unique: false })
          breedingStore.createIndex('synced', 'synced', { unique: false })
        }
      }
    })
  }

  // Farms operations
  async addFarm(farm: Farm): Promise<void> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('farms', 'readwrite')
    const store = tx.objectStore('farms')
    store.put(farm)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getFarm(id: string): Promise<Farm | undefined> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('farms', 'readonly')
    const store = tx.objectStore('farms')
    const request = store.get(id)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllFarms(): Promise<Farm[]> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('farms', 'readonly')
    const store = tx.objectStore('farms')
    const request = store.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateFarm(farm: Farm): Promise<void> {
    return this.addFarm({ ...farm, synced: false, updatedAt: new Date().toISOString() })
  }

  async deleteFarm(id: string): Promise<void> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('farms', 'readwrite')
    const store = tx.objectStore('farms')
    store.delete(id)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // Sync queue operations
  async addToSyncQueue(item: SyncQueue): Promise<void> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('syncQueue', 'readwrite')
    const store = tx.objectStore('syncQueue')
    store.put(item)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getSyncQueue(): Promise<SyncQueue[]> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('syncQueue', 'readonly')
    const store = tx.objectStore('syncQueue')
    // Some browsers don't accept boolean keys in IDBKeyRange.only(false).
    // Read all items and filter in JS for robustness.
    const request = store.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const all: SyncQueue[] = request.result || []
        // Return items that are not marked synced (either missing or false)
        const pending = all.filter(item => item.synced !== true)
        resolve(pending)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async markSynced(id: string): Promise<void> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('syncQueue', 'readwrite')
    const store = tx.objectStore('syncQueue')
    const request = store.get(id)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const item = request.result
        if (item) {
          item.synced = true
          store.put(item)
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async clearSyncedItems(): Promise<void> {
    if (!this.db) await this.init()
    // Get all items and delete those marked as synced
    const tx = this.db!.transaction('syncQueue', 'readwrite')
    const store = tx.objectStore('syncQueue')
    const getAllReq = store.getAll()
    return new Promise((resolve, reject) => {
      getAllReq.onsuccess = () => {
        const all: SyncQueue[] = getAllReq.result || []
        const synced = all.filter(item => item.synced)
        synced.forEach(item => store.delete(item.id))
      }
      getAllReq.onerror = () => reject(getAllReq.error)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // Breeding operations
  async addBreeding(breeding: Breeding): Promise<void> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('breedings', 'readwrite')
    const store = tx.objectStore('breedings')
    store.put(breeding)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getBreeding(id: string): Promise<Breeding | undefined> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('breedings', 'readonly')
    const store = tx.objectStore('breedings')
    const request = store.get(id)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getBreedingsByAnimal(animalUuid: string): Promise<Breeding[]> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('breedings', 'readonly')
    const store = tx.objectStore('breedings')
    const index = store.index('animal_uuid')
    const request = index.getAll(animalUuid)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getAllBreedings(): Promise<Breeding[]> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('breedings', 'readonly')
    const store = tx.objectStore('breedings')
    const request = store.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async updateBreeding(breeding: Breeding): Promise<void> {
    return this.addBreeding({ ...breeding, synced: false, updatedAt: new Date().toISOString() })
  }

  async deleteBreeding(id: string): Promise<void> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('breedings', 'readwrite')
    const store = tx.objectStore('breedings')
    store.delete(id)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // Cache operations
  async setCache(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('cache', 'readwrite')
    const store = tx.objectStore('cache')
    const expiry = ttl ? Date.now() + ttl : null
    store.put({ key, data, expiry })
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getCache(key: string): Promise<any> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('cache', 'readonly')
    const store = tx.objectStore('cache')
    const request = store.get(key)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }
        if (result.expiry && result.expiry < Date.now()) {
          // Expired, delete it
          this.deleteCache(key)
          resolve(null)
          return
        }
        resolve(result.data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteCache(key: string): Promise<void> {
    if (!this.db) await this.init()
    const tx = this.db!.transaction('cache', 'readwrite')
    const store = tx.objectStore('cache')
    store.delete(key)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

export const db = new FarmManageDB()
