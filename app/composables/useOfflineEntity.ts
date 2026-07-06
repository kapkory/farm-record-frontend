// Generic offline-first resource factory.
//
// Wraps one registry entity (see app/utils/offline/registry.ts) with
// local-first CRUD: every mutation is written to IndexedDB and queued
// before the API is attempted, reads are API-first with an IndexedDB
// fallback, and offline-created records keep their client-generated uuid
// forever (the backend stores it as-is), so records created offline can be
// referenced by children before they ever reach the server.
//
// Per-entity composables stay thin: they own form state and labels and
// delegate persistence here.
import { ref, type Ref } from 'vue'
import { db, type EntityCtx, type SyncQueueItem } from '../utils/db'
import { entityRegistry, type EntityConfig, type EntityName } from '../utils/offline/registry'

export interface OfflineRecord {
  uuid?: string
  synced?: boolean
  sync_error?: string | null
  [key: string]: any
}

export type MutationResult<T> =
  | { ok: true, record: T, synced: boolean }
  | { ok: false, message: string, errors: Record<string, string[]> }

export const useOfflineEntity = <T extends OfflineRecord>(entity: EntityName, ctx: EntityCtx = {}) => {
  const { $apiFetch } = useNuxtApp()
  const { isOnline, syncOne, refreshCounts } = useOffline()
  const config: EntityConfig = entityRegistry[entity]
  const parent = config.parentOf(ctx) ?? ''

  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const loadError = ref<string | null>(null)
  /** True when `items` came from IndexedDB instead of the API */
  const fromCache = ref(false)

  const decorate = (record: T, synced: boolean, syncError: string | null = null): T =>
    ({ ...record, synced, sync_error: syncError })

  const readLocal = async (): Promise<T[]> => {
    const records = await db.listRecords<T>(entity, parent)
    return records
      .sort((a, b) => b.savedAt - a.savedAt)
      .map(r => decorate(r.data, r.synced, r.syncError))
  }

  /** API-first list; caches server records and overlays local unsynced ones. */
  const fetch = async (): Promise<T[]> => {
    loading.value = true
    loadError.value = null
    fromCache.value = false
    try {
      if (!isOnline.value) throw new Error('offline')

      const response = await $apiFetch<any>(config.endpoints.list(ctx))
      const records: T[] = (Array.isArray(response) ? response : response?.data) ?? []

      for (const record of records) {
        if (record.uuid) await db.putRecord(entity, record.uuid, parent, record, true)
      }

      // Records created/edited offline that the server doesn't know yet must
      // not disappear from the list after a refetch.
      const local = await db.listRecords<T>(entity, parent)
      const unsyncedOnly = local.filter(r => !r.synced && !records.some(s => s.uuid === r.uuid))

      items.value = [
        ...unsyncedOnly.map(r => decorate(r.data, false, r.syncError)),
        ...records.map(r => decorate(r, true))
      ]
    } catch (err) {
      try {
        items.value = await readLocal()
        fromCache.value = true
      } catch (localErr) {
        console.error(`Failed to load ${entity} from API and cache:`, err, localErr)
        loadError.value = err instanceof Error ? err.message : `Failed to load ${entity} records`
        items.value = []
      }
    } finally {
      loading.value = false
    }
    return items.value
  }

  /** Single record, API-first with IndexedDB fallback. */
  const find = async (uuid: string): Promise<T | null> => {
    const showUrl = config.endpoints.show?.(uuid, ctx)
    if (showUrl && isOnline.value) {
      try {
        const response = await $apiFetch<any>(showUrl)
        const record: T = response?.data ?? response
        if (record?.uuid) {
          await db.putRecord(entity, record.uuid, parent, record, true)
          return decorate(record, true)
        }
      } catch (err) {
        console.error(`Failed to fetch ${entity} ${uuid}, trying cache:`, err)
      }
    }
    const local = await db.getRecord<T>(entity, uuid)
    return local ? decorate(local.data, local.synced, local.syncError) : null
  }

  /**
   * Local-first create. `payload` is the API body; `display` optionally
   * enriches what's shown/stored locally until the server copy arrives
   * (e.g. resolved names for foreign keys).
   */
  const create = async (payload: Record<string, any>, display?: Record<string, any>): Promise<MutationResult<T>> => {
    const uuid = crypto.randomUUID()
    const body = { ...payload, uuid }
    const optimistic = { ...(display ?? payload), uuid, created_at: new Date().toISOString() } as unknown as T

    await db.putRecord(entity, uuid, parent, optimistic, false)
    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      action: 'create',
      entity,
      uuid,
      ctx,
      payload: body,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending'
    }
    await db.enqueue(item)

    if (isOnline.value) {
      const result = await syncOne(item)
      if (result.ok) {
        const serverRecord: T = result.response?.data ?? optimistic
        await db.putRecord(entity, uuid, parent, serverRecord, true)
        items.value = [decorate(serverRecord, true), ...items.value]
        await refreshCounts()
        return { ok: true, record: serverRecord, synced: true }
      }
      if (result.kind === 'validation') {
        // The server rejected it — roll the optimistic record back so the
        // form can surface the errors instead of leaving a poison pill.
        await db.deleteRecord(entity, uuid)
        await db.deleteQueueItem(item.id)
        await refreshCounts()
        return { ok: false, message: result.message, errors: result.errors }
      }
      // auth/network: leave it queued, fall through to the offline path
    }

    items.value = [decorate(optimistic, false), ...items.value]
    await refreshCounts()
    return { ok: true, record: optimistic, synced: false }
  }

  /** Local-first partial update, coalesced into a pending create/update
   *  for the same record when one exists (the server hasn't seen the
   *  record yet, so there is nothing to PUT against). */
  const update = async (uuid: string, patch: Record<string, any>): Promise<MutationResult<T>> => {
    const existing = await db.getRecord<T>(entity, uuid)
    const merged = { ...(existing?.data ?? {}), ...patch, uuid } as T
    await db.putRecord(entity, uuid, existing?.parent ?? parent, merged, false)

    const pending = await db.getPendingFor(entity, uuid)
    let item: SyncQueueItem
    if (pending) {
      item = { ...pending, payload: { ...pending.payload, ...patch }, timestamp: pending.timestamp }
      await db.enqueue(item)
    } else {
      item = {
        id: crypto.randomUUID(),
        action: 'update',
        entity,
        uuid,
        ctx,
        payload: patch,
        timestamp: Date.now(),
        attempts: 0,
        status: 'pending'
      }
      await db.enqueue(item)
    }

    const applyToItems = (record: T, synced: boolean) => {
      const idx = items.value.findIndex(i => i.uuid === uuid)
      if (idx !== -1) items.value[idx] = decorate(record, synced)
    }

    if (isOnline.value) {
      const result = await syncOne(item)
      if (result.ok) {
        const serverRecord: T = result.response?.data ?? merged
        await db.putRecord(entity, uuid, existing?.parent ?? parent, serverRecord, true)
        applyToItems(serverRecord, true)
        await refreshCounts()
        return { ok: true, record: serverRecord, synced: true }
      }
      if (result.kind === 'validation') {
        // Revert the local copy to what it was before the bad patch.
        if (existing) {
          await db.putRecord(entity, uuid, existing.parent, existing.data, existing.synced, existing.syncError)
          applyToItems(existing.data, existing.synced)
        }
        await db.deleteQueueItem(item.id)
        await refreshCounts()
        return { ok: false, message: result.message, errors: result.errors }
      }
    }

    applyToItems(merged, false)
    await refreshCounts()
    return { ok: true, record: merged, synced: false }
  }

  /** Local-first delete. Deleting a record whose create is still queued
   *  cancels both without ever touching the API. */
  const remove = async (uuid: string): Promise<void> => {
    items.value = items.value.filter(i => i.uuid !== uuid)

    const pending = await db.getPendingFor(entity, uuid)
    if (pending?.action === 'create') {
      await db.deleteQueueItem(pending.id)
      await db.deleteRecord(entity, uuid)
      await refreshCounts()
      return
    }

    await db.deleteRecord(entity, uuid)
    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      action: 'delete',
      entity,
      uuid,
      ctx,
      payload: null,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending'
    }
    await db.enqueue(item)

    if (isOnline.value) await syncOne(item)
    await refreshCounts()
  }

  return { items, loading, loadError, fromCache, fetch, find, create, update, remove }
}
