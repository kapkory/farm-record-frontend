// IndexedDB wrapper for offline-first data storage.
//
// v3 replaces the per-entity object stores (`farms`, `breedings`) with a
// single generic `records` store keyed by `${entity}:${uuid}`, so adding a
// new offline entity no longer requires a schema bump. Records hold the
// server-shaped payload verbatim inside an envelope with sync metadata.

const DB_NAME = 'FarmManageDB'
const DB_VERSION = 3

export type SyncAction = 'create' | 'update' | 'delete'
export type SyncStatus = 'pending' | 'failed' | 'synced'

/** Parent scoping passed by callers (animal uuid, morph alias, farm uuid, …). */
export type EntityCtx = Record<string, string>

export interface LocalRecord<T = any> {
  /** `${entity}:${uuid}` — primary key */
  key: string
  entity: string
  uuid: string
  /** Owning parent (e.g. animal uuid) for offline list queries; '' when none.
   *  Never null — IndexedDB compound index keys cannot contain null. */
  parent: string
  /** Server-shaped record (snake_case + uuid), or the optimistic local copy */
  data: T
  synced: boolean
  /** Set when a background sync attempt was rejected (422/404) */
  syncError: string | null
  savedAt: number
}

export interface SyncQueueItem {
  id: string
  action: SyncAction
  entity: string
  /** Client-generated uuid of the record — final, the server accepts it as-is */
  uuid: string
  ctx: EntityCtx
  payload: any
  timestamp: number
  attempts: number
  status: SyncStatus
  lastError?: string
}

const recordKey = (entity: string, uuid: string) => `${entity}:${uuid}`

/** Best-effort translation of a v2 queue item into the v3 shape. */
function upgradeQueueItem(item: any): SyncQueueItem {
  if (item.payload !== undefined && item.status !== undefined) return item

  const data = item.data ?? {}
  const uuid = data._localId ?? data.uuid ?? data.id ?? ''
  const payload: any = { ...data }
  delete payload._localId
  if (item.action === 'create' && uuid) payload.uuid = uuid

  const ctx: EntityCtx = {}
  if (typeof data.animal_uuid === 'string') ctx.animalUuid = data.animal_uuid

  return {
    id: item.id,
    action: item.action,
    entity: item.entity,
    uuid,
    ctx,
    payload,
    timestamp: item.timestamp ?? Date.now(),
    attempts: item.attempts ?? 0,
    status: item.synced ? 'synced' : (item.status ?? 'pending'),
    lastError: item.lastError
  }
}

class FarmManageDB {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const tx = (event.target as IDBOpenDBRequest).transaction!

        if (!db.objectStoreNames.contains('records')) {
          const records = db.createObjectStore('records', { keyPath: 'key' })
          records.createIndex('entity', 'entity', { unique: false })
          records.createIndex('entity_parent', ['entity', 'parent'], { unique: false })
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        } else {
          // v2 → v3: annotate existing queue items in place
          const syncStore = tx.objectStore('syncQueue')
          syncStore.openCursor().onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
            if (!cursor) return
            cursor.update(upgradeQueueItem(cursor.value))
            cursor.continue()
          }
        }

        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }

        // v2 → v3: carry over unsynced rows from the old per-entity stores
        // (synced rows are just cache — they are refetched from the API).
        const migrate = (storeName: string, entity: string, parentOf: (row: any) => string | null) => {
          if (!db.objectStoreNames.contains(storeName)) return
          const records = tx.objectStore('records')
          tx.objectStore(storeName).openCursor().onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
            if (!cursor) {
              db.deleteObjectStore(storeName)
              return
            }
            const row = cursor.value
            if (row.synced !== true && row.id) {
              records.put({
                key: recordKey(entity, row.id),
                entity,
                uuid: row.id,
                parent: parentOf(row) ?? '',
                data: { ...row, uuid: row.id },
                synced: false,
                syncError: null,
                savedAt: Date.now()
              } satisfies LocalRecord)
            }
            cursor.continue()
          }
        }
        migrate('farms', 'farm', () => null)
        migrate('breedings', 'breeding', row => row.animal_uuid ?? null)
      }
    })

    try {
      await this.initPromise
    } finally {
      this.initPromise = null
    }
  }

  private async tx(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    if (!this.db) await this.init()
    return this.db!.transaction(storeName, mode).objectStore(storeName)
  }

  private request<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  private complete(store: IDBObjectStore): Promise<void> {
    return new Promise((resolve, reject) => {
      store.transaction.oncomplete = () => resolve()
      store.transaction.onerror = () => reject(store.transaction.error)
    })
  }

  // ── Generic records ────────────────────────────────────────────────────

  async putRecord<T>(
    entity: string,
    uuid: string,
    parent: string | null,
    data: T,
    synced: boolean,
    syncError: string | null = null
  ): Promise<void> {
    const store = await this.tx('records', 'readwrite')
    store.put({
      key: recordKey(entity, uuid),
      entity,
      uuid,
      parent: parent ?? '',
      data,
      synced,
      syncError,
      savedAt: Date.now()
    } satisfies LocalRecord<T>)
    return this.complete(store)
  }

  async getRecord<T = any>(entity: string, uuid: string): Promise<LocalRecord<T> | undefined> {
    const store = await this.tx('records', 'readonly')
    return this.request(store.get(recordKey(entity, uuid)))
  }

  async listRecords<T = any>(entity: string, parent?: string | null): Promise<LocalRecord<T>[]> {
    const store = await this.tx('records', 'readonly')
    if (parent === undefined) {
      return this.request(store.index('entity').getAll(entity))
    }
    return this.request(store.index('entity_parent').getAll([entity, parent ?? '']))
  }

  async deleteRecord(entity: string, uuid: string): Promise<void> {
    const store = await this.tx('records', 'readwrite')
    store.delete(recordKey(entity, uuid))
    return this.complete(store)
  }

  async setRecordSynced(entity: string, uuid: string, synced: boolean, syncError: string | null = null): Promise<void> {
    const existing = await this.getRecord(entity, uuid)
    if (!existing) return
    return this.putRecord(entity, uuid, existing.parent, existing.data, synced, syncError)
  }

  // ── Sync queue ─────────────────────────────────────────────────────────

  async enqueue(item: SyncQueueItem): Promise<void> {
    const store = await this.tx('syncQueue', 'readwrite')
    store.put(item)
    return this.complete(store)
  }

  /** Pending items, oldest first. */
  async getPending(): Promise<SyncQueueItem[]> {
    const all = await this.getQueue()
    return all
      .filter(item => item.status === 'pending')
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  async getQueue(): Promise<SyncQueueItem[]> {
    const store = await this.tx('syncQueue', 'readonly')
    const all = await this.request(store.getAll())
    return (all || []).map(upgradeQueueItem)
  }

  async getFailed(): Promise<SyncQueueItem[]> {
    const all = await this.getQueue()
    return all.filter(item => item.status === 'failed')
  }

  /** The pending create/update queued for a record, if any (for coalescing). */
  async getPendingFor(entity: string, uuid: string): Promise<SyncQueueItem | undefined> {
    const pending = await this.getPending()
    return pending.find(item => item.entity === entity && item.uuid === uuid)
  }

  async updateQueueItem(id: string, patch: Partial<SyncQueueItem>): Promise<void> {
    const store = await this.tx('syncQueue', 'readwrite')
    const req = store.get(id)
    req.onsuccess = () => {
      const item = req.result
      if (item) store.put({ ...upgradeQueueItem(item), ...patch })
    }
    return this.complete(store)
  }

  async deleteQueueItem(id: string): Promise<void> {
    const store = await this.tx('syncQueue', 'readwrite')
    store.delete(id)
    return this.complete(store)
  }

  // ── Cache (TTL) ────────────────────────────────────────────────────────

  async setCache(key: string, data: any, ttl?: number): Promise<void> {
    const store = await this.tx('cache', 'readwrite')
    const expiry = ttl ? Date.now() + ttl : null
    store.put({ key, data, expiry, savedAt: Date.now() })
    return this.complete(store)
  }

  async getCache(key: string): Promise<any> {
    const entry = await this.getCacheEntry(key)
    return entry?.data ?? null
  }

  /** Like getCache but also reports staleness instead of dropping expired data. */
  async getCacheEntry(key: string): Promise<{ data: any, stale: boolean, savedAt?: number } | null> {
    const store = await this.tx('cache', 'readonly')
    const result = await this.request(store.get(key))
    if (!result) return null
    const stale = !!(result.expiry && result.expiry < Date.now())
    return { data: result.data, stale, savedAt: result.savedAt }
  }

  async deleteCache(key: string): Promise<void> {
    const store = await this.tx('cache', 'readwrite')
    store.delete(key)
    return this.complete(store)
  }
}

export const db = new FarmManageDB()
