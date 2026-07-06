// Offline sync engine: network status + the queue drain loop.
//
// State is module-scoped so every caller of useOffline() shares the same
// refs (the OfflineIndicator badge and the composables always agree).
// Requests are built from the entity registry (app/utils/offline/registry.ts)
// — an entity without a registry entry is marked failed, never silently
// dropped. Creates carry a client-generated uuid the backend stores as-is,
// so replaying a request after a mid-flight network drop cannot duplicate
// records.
import { ref, readonly } from 'vue'
import { db, type SyncQueueItem } from '../utils/db'
import { getEntityConfig } from '../utils/offline/registry'

const MAX_ATTEMPTS = 10

const isOnline = ref(true)
const lastOnline = ref<Date | null>(null)
const pendingSyncCount = ref(0)
const failedSyncCount = ref(0)
/** True when sync stopped on a 401 — the session expired while offline */
const authRequired = ref(false)
const syncing = ref(false)

let listenersRegistered = false
let drainInFlight: Promise<void> | null = null

export type SyncResult =
  | { ok: true, response?: any }
  | { ok: false, kind: 'validation', message: string, errors: Record<string, string[]> }
  | { ok: false, kind: 'auth' }
  | { ok: false, kind: 'network' }
  | { ok: false, kind: 'unroutable', message: string }

function statusOf(error: any): number | undefined {
  return error?.response?.status ?? error?.status ?? error?.statusCode
}

function responseData(error: any): any {
  return error?.response?._data ?? error?.data ?? {}
}

function buildRequest(item: SyncQueueItem): { url: string, method: string, body?: any } | null {
  const config = getEntityConfig(item.entity)
  if (!config) return null

  if (item.action === 'create') {
    return { url: config.endpoints.create(item.ctx), method: 'POST', body: item.payload }
  }
  if (item.action === 'update' && config.endpoints.update) {
    return {
      url: config.endpoints.update(item.uuid, item.ctx),
      method: config.endpoints.updateMethod ?? 'PUT',
      body: item.payload
    }
  }
  if (item.action === 'delete' && config.endpoints.remove) {
    return { url: config.endpoints.remove(item.uuid, item.ctx), method: 'DELETE' }
  }
  return null
}

function getApiFetch(): ((...args: any[]) => Promise<any>) | null {
  try {
    return useNuxtApp().$apiFetch as any
  } catch {
    return null
  }
}

async function refreshCounts() {
  try {
    pendingSyncCount.value = (await db.getPending()).length
    failedSyncCount.value = (await db.getFailed()).length
  } catch (error) {
    console.error('Error refreshing sync counts:', error)
  }
}

/**
 * Execute a single queue item against the API and do its bookkeeping:
 * success deletes the item and marks the record synced; a validation
 * rejection (422/404) rolls the item and record into a failed state the
 * user can discard; network/server errors leave it queued for retry.
 */
async function syncOne(item: SyncQueueItem): Promise<SyncResult> {
  const apiFetch = getApiFetch()
  if (!apiFetch) return { ok: false, kind: 'network' }

  const request = buildRequest(item)
  if (!request) {
    const message = `No sync route registered for "${item.entity}" (${item.action})`
    console.error(message)
    await db.updateQueueItem(item.id, { status: 'failed', lastError: message })
    await db.setRecordSynced(item.entity, item.uuid, false, message)
    return { ok: false, kind: 'unroutable', message }
  }

  try {
    await apiFetch('/sanctum/csrf-cookie')
    const response = await apiFetch(request.url, {
      method: request.method,
      ...(request.body ? { body: request.body } : {})
    })

    await db.deleteQueueItem(item.id)
    if (item.action === 'delete') {
      await db.deleteRecord(item.entity, item.uuid)
    } else {
      await db.setRecordSynced(item.entity, item.uuid, true)
    }
    return { ok: true, response }
  } catch (error: any) {
    const status = statusOf(error)

    if (status === 401 || status === 419) {
      authRequired.value = true
      return { ok: false, kind: 'auth' }
    }

    if (status === 422 || status === 404) {
      const data = responseData(error)
      const message = data?.message || `Rejected by the server (${status})`
      await db.updateQueueItem(item.id, { status: 'failed', lastError: message })
      await db.setRecordSynced(item.entity, item.uuid, false, message)
      return { ok: false, kind: 'validation', message, errors: data?.errors ?? {} }
    }

    // Network drop or 5xx — keep it queued, but cap retries so one poisoned
    // item can't hot-loop forever.
    const attempts = (item.attempts ?? 0) + 1
    if (attempts >= MAX_ATTEMPTS) {
      const message = `Gave up after ${attempts} attempts: ${error?.message ?? 'unknown error'}`
      await db.updateQueueItem(item.id, { status: 'failed', lastError: message })
      await db.setRecordSynced(item.entity, item.uuid, false, message)
    } else {
      await db.updateQueueItem(item.id, { attempts })
    }
    return { ok: false, kind: 'network' }
  }
}

/** Drain the queue FIFO. Creates are enqueued before their children, and
 *  client uuids are final, so plain timestamp order is dependency-safe. */
async function syncPendingChanges(): Promise<void> {
  if (drainInFlight) return drainInFlight

  drainInFlight = (async () => {
    try {
      await db.init()
      const queue = await db.getPending()
      await refreshCounts()
      if (queue.length === 0 || !isOnline.value) return

      syncing.value = true
      for (const item of queue) {
        const result = await syncOne(item)
        // A 401 means every remaining request would fail too; a network
        // error means connectivity is gone again. Stop and keep the queue.
        if (!result.ok && (result.kind === 'auth' || result.kind === 'network')) break
      }
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      syncing.value = false
      await refreshCounts()
      drainInFlight = null
    }
  })()

  return drainInFlight
}

/** Drop a failed queue item. Failed creates take their local record along;
 *  failed updates/deletes keep the record and clear its error badge (the
 *  server copy is refetched on the next online read). */
async function discardFailed(id: string): Promise<void> {
  const item = (await db.getQueue()).find(entry => entry.id === id)
  if (!item) return
  await db.deleteQueueItem(id)
  if (item.action === 'create') {
    await db.deleteRecord(item.entity, item.uuid)
  } else {
    await db.setRecordSynced(item.entity, item.uuid, true)
  }
  await refreshCounts()
}

async function discardAllFailed(): Promise<void> {
  for (const item of await db.getFailed()) {
    await discardFailed(item.id)
  }
}

export const useOffline = () => {
  if (import.meta.client && !listenersRegistered) {
    listenersRegistered = true
    isOnline.value = navigator.onLine

    const updateOnlineStatus = () => {
      const wasOffline = !isOnline.value
      isOnline.value = navigator.onLine
      if (isOnline.value && wasOffline) {
        syncPendingChanges()
      } else if (!isOnline.value) {
        lastOnline.value = new Date()
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    // Mobile PWAs often regain connectivity while backgrounded without an
    // 'online' event — re-check whenever the app comes back to foreground.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        isOnline.value = true
        syncPendingChanges()
      }
    })

    refreshCounts()
    if (navigator.onLine) syncPendingChanges()
  }

  const triggerSync = () => {
    if (isOnline.value) return syncPendingChanges()
    return Promise.resolve()
  }

  /** Call after a successful login so a 401-stalled queue resumes. */
  const notifyAuthenticated = () => {
    authRequired.value = false
    return triggerSync()
  }

  return {
    isOnline: readonly(isOnline),
    lastOnline: readonly(lastOnline),
    pendingSyncCount: readonly(pendingSyncCount),
    failedSyncCount: readonly(failedSyncCount),
    authRequired: readonly(authRequired),
    syncing: readonly(syncing),
    triggerSync,
    notifyAuthenticated,
    discardFailed,
    discardAllFailed,
    syncOne,
    refreshCounts,
    /** @deprecated use refreshCounts() */
    updatePendingCount: refreshCounts
  }
}
