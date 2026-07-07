# Offline-First Implementation Guide

Farmconsul is an offline-first PWA: every field-work mutation is written to
IndexedDB and queued before the API is attempted, and reads fall back to
IndexedDB (or a TTL cache) when offline. This guide describes the actual
architecture — the generic entity layer added in DB schema **v3**.

## The three building blocks

### 1. Entity registry — `app/utils/offline/registry.ts`

One config object mapping each offline-capable entity to its API endpoints
and parent scoping. It is the single source of truth for both the sync
engine and the composable factory. An entity that isn't in the registry
cannot be queued or synced.

```ts
breeding: {
  name: 'breeding',
  endpoints: {
    list: ctx => `/api/v1/farms/farm/animals/breedings/list/${ctx.animalUuid}`,
    create: () => '/api/v1/farms/farm/animals/breedings',
    update: uuid => `/api/v1/farms/farm/animals/breedings/${uuid}`
  },
  parentOf: ctx => ctx.animalUuid ?? null   // used for offline list queries
}
```

Polymorphic entities (task, treatment, transaction, production) pass their
morph alias (`planting` | `animal` | `animal_group`) and parent uuid through
`ctx`. Those alias strings must match the backend `Relation::morphMap`.

### 2. Generic factory — `app/composables/useOfflineEntity.ts`

`useOfflineEntity<T>(entity, ctx)` returns `{ items, loading, fetch, find,
create, update, remove }`:

- **`fetch()`** — API-first list; caches each server record in IndexedDB
  (`synced: true`) and overlays any local unsynced records so offline-created
  rows don't vanish after a refetch. Offline/error → reads from IndexedDB.
- **`create(payload, display?)`** — generates the uuid up front (the backend
  stores client uuids as-is), writes the record locally, queues it, then
  attempts an immediate sync when online. On a 422 it rolls the optimistic
  record back and returns the field errors; on a network error it stays
  queued. `display` optionally enriches the optimistic copy (resolved names
  for foreign keys) shown until the server copy arrives.
- **`update(uuid, patch)`** — coalesces into a pending create/update for the
  same record when one exists.
- **`remove(uuid)`** — deleting a record whose create is still queued cancels
  both without touching the API.

Per-entity composables stay thin — they own form/label state and delegate
persistence here. See `useAnimalBreedings.ts` for the canonical example.

### 3. Sync engine — `app/composables/useOffline.ts`

Module-scoped singleton state (`isOnline`, `pendingSyncCount`,
`failedSyncCount`, `authRequired`) shared by every caller. The drain loop
runs FIFO by timestamp behind an in-flight mutex; because client uuids are
final, parents enqueued before children sync safely without a dependency
graph. Error handling:

- **401 / 419** → pause the queue, set `authRequired`; a successful login
  (`auth.ts` calls `notifyAuthenticated()`) resumes it.
- **422 / 404** → mark the item `failed` and flag the local record; the user
  can discard it from the indicator (never silently dropped).
- **network / 5xx** → retry with an attempt cap (10) so a poison item can't
  hot-loop.

Sync is triggered on the `online` event, app mount, login, and
`visibilitychange → visible` (mobile PWA resume).

## Reference data — `app/composables/useReferenceData.ts`

Read-through TTL cache for dropdown/lookup lists (sires, assignees, treatment
types, ledger accounts, crops, …). Online it fetches and caches; offline it
returns the cached copy with `stale: true`. Field forms depend on these
lists, so they are cached during Phase-1 flows and reused by the settings
screens.

## IndexedDB — `app/utils/db.ts` (schema v3)

One generic `records` store keyed by `${entity}:${uuid}`, with an `entity`
index and a compound `['entity','parent']` index. Records hold the
server-shaped payload verbatim in an envelope
(`{ key, entity, uuid, parent, data, synced, syncError, savedAt }`), so
adding a new entity never needs a schema bump — just a registry entry. The
`syncQueue` and TTL `cache` stores round it out. The v3 upgrade migrates
unsynced rows and queue items from the old per-entity stores.

## Adding a new offline entity

1. Add an entry to `entityRegistry` (endpoints + `parentOf`).
2. If the backend create should be idempotent, accept a client `uuid` there
   (see `app/Traits/ResolvesClientUuid.php` in the backend).
3. In the composable/page, call `useOfflineEntity<T>('yourEntity', ctx)` and
   use its `fetch`/`create`/`update`/`remove`.

No `db.ts` or `useOffline.ts` changes required.

## Testing offline behaviour

Chrome DevTools → Network → **Offline** (run against a local Laravel):

1. Browse online to fill caches, go offline, create records → they appear
   with a pending badge and `pendingSyncCount` increments; reload offline →
   they persist.
2. Create a parent (e.g. animal) offline, then a child (health record) → both
   queue FIFO. Go online → they sync in order carrying their client uuids.
3. Toggle offline mid-drain then reconnect → **no duplicates** (idempotent
   replay).
4. A server-invalid record lands in the "failed" state, discardable from the
   indicator.
5. Expired session → sync halts with "log in to sync"; logging in resumes it.

Note: the service worker's NetworkFirst cache for `/api/**` can serve a stale
200 while "offline", masking the IndexedDB fallback — test with DevTools
"Bypass for network" both on and off.

## PWA configuration — `nuxt.config.ts`

`@vite-pwa/nuxt`, `generateSW`, auto-update. Runtime caching: NetworkFirst
for pages and `/api/**` (24h, 10s network timeout), CacheFirst for images.
`navigateFallback: null` — Nginx handles SPA routing. Enabled in dev for
testing.
