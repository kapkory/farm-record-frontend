# Offline-First Implementation Plan — Farm App Frontend

## Current State

The project has a **foundation** for offline-first (IndexedDB `farms` store, sync queue skeleton, PWA/Workbox config, `useOffline`/`useOfflineData` composables) but **nothing is actually wired together**. All API calls in sync logic are commented-out stubs. Only the `farms` entity has an IndexedDB store — the other 12+ entity types (plantings, fields, crops, crop varieties, treatments, treatment types, tasks, harvests, livestock, users, personnels, ledger accounts) are missing. Every page and component makes direct `$apiFetch` calls with no offline fallback.

This plan covers 8 phases to deliver a fully offline-first app.

---

## Phase 1: Expand the IndexedDB Schema

**No dependencies — start here**

**File:** `app/utils/db.ts`

### Steps

1. **Bump DB version** from 1 → 2 to trigger `onupgradeneeded`
2. **Add object stores** for every entity type the app uses:

   | Store | Key Path | Indexes |
   |-------|----------|---------|
   | `plantings` | `uuid` | `farm_uuid`, `status`, `synced` |
   | `fields` | `uuid` | `farm_uuid`, `is_active`, `synced` |
   | `crops` | `uuid` | `name`, `synced` |
   | `cropVarieties` | `uuid` | `crop_uuid`, `synced` |
   | `treatmentTypes` | `uuid` | `synced` |
   | `treatments` | `uuid` | `planting_uuid`, `synced` |
   | `tasks` | `uuid` | `taskable_uuid`, `synced` |
   | `harvests` | `uuid` | `planting_uuid`, `synced` |
   | `livestock` | `uuid` | `farm_uuid`, `synced` |
   | `users` | `uuid` | `farm_uuid`, `synced` |
   | `personnels` | `uuid` | `farm_uuid`, `synced` |
   | `ledgerAccounts` | `id` | `type`, `synced` |
   | `ledgerTransactions` | `uuid` | `planting_uuid`, `type`, `synced` |

3. **Define TypeScript interfaces** for each entity (mirror backend API response shapes)
4. **Add generic CRUD helpers** to reduce boilerplate:
   - `addEntity<T>(storeName, item)` — upsert with `synced: false`
   - `getEntity<T>(storeName, id)` — get by key
   - `getAllEntities<T>(storeName)` — get all
   - `deleteEntity(storeName, id)` — remove
   - `getUnsyncedEntities<T>(storeName)` — query by `synced === false`
   - `markEntitySynced(storeName, id)` — flip `synced` to `true`
5. **Update `SyncQueue.entity` type union** to include all new entity types
6. **Add `retryCount`, `lastAttempt`, `status` fields** to `SyncQueue` schema for Phase 3
7. **Handle migration** for existing users: wrap store creation in `if (!db.objectStoreNames.contains(name))` guards

---

## Phase 2: Build Entity-Specific Offline Composables

**Depends on Phase 1**

### Contract

Every composable follows the same local-first pattern:

```
save(entity)    → write to IndexedDB (synced: false) + add to syncQueue + attempt API call if online
getAll(filters) → read from IndexedDB; if online + stale, fetch from API and merge into IDB
getOne(id)      → read from IndexedDB; if online, refresh from API
remove(id)      → delete from IndexedDB + add delete action to syncQueue + attempt API DELETE if online
```

### New Composable Files

| Composable | Entities | API Endpoints |
|---|---|---|
| `useOfflineFarms.ts` | Farms | `/api/v1/farms` |
| `useOfflinePlantings.ts` | Plantings, Ledger Transactions | `/api/v1/plantings`, `/api/v1/ledger-transactions` |
| `useOfflineFields.ts` | Fields | `/api/v1/farms/{uuid}/fields` |
| `useOfflineCrops.ts` | Crops, Crop Varieties, Treatment Types | `/api/v1/crops`, `/api/v1/crop-varieties`, `/api/v1/treatment-types` |
| `useOfflineLivestock.ts` | Livestock | `/api/v1/livestock` |
| `useOfflineTasks.ts` | Tasks + Subtasks | `/api/v1/tasks` |
| `useOfflineHarvests.ts` | Harvests | `/api/v1/harvests` |
| `useOfflineTreatments.ts` | Treatments | `/api/v1/treatments` |
| `useOfflineUsers.ts` | Farm Users, Personnels | `/api/v1/farm-users`, `/api/v1/personnels` |
| `useOfflineSettings.ts` | Ledger Accounts | `/api/v1/ledger-accounts` |

### Data Freshness Strategy

Use the existing `cache` store with TTL:
- `getAll()` checks if cached response is < 5 minutes old; if so, return IDB data directly
- If stale and online, fetch from API, update IDB, refresh cache timestamp
- If offline, always return IDB data regardless of age

### Migration

Refactor existing `app/composables/useOfflineData.ts` into `useOfflineFarms.ts` and **uncomment all stubbed API calls**.

---

## Phase 3: Implement Real Sync Engine

**Depends on Phase 2**

**File:** `app/composables/useOffline.ts`

### Steps

1. **Replace stubbed `syncPendingChanges()`** with real API calls:
   - Read all unsynced items from `syncQueue`
   - Group by entity type
   - For each item, call the appropriate API endpoint
   - On success: `markSynced(id)` + `markEntitySynced(storeName, entityId)`
   - On failure: log error, increment retry count, skip item (will retry next cycle)

2. **Add retry logic with exponential backoff:**
   - Backoff formula: `min(2^retryCount * 1000, 60000)` ms
   - Skip items whose `lastAttempt + backoff > now`
   - After 10 failed retries, mark as `failed` and surface to user

3. **Add conflict detection (Server-Wins Strategy):**
   - On sync, if server returns 409 or `updatedAt` is newer than local, keep server version
   - Store conflict in a `conflicts` array exposed to UI so user can review
   - Future enhancement: three-way merge for field-level conflicts

4. **Order-dependent sync:**
   - Sort queue by `timestamp` ascending (FIFO)
   - Process creates before updates, updates before deletes for same entity
   - Handle parent-child: sync farms before fields/plantings that reference them

5. **Batch sync optimization:**
   - Group small operations; send batch API requests where backend supports it
   - Fall back to sequential for backends without batch endpoints

6. **Add `syncStatus` reactive state:**
   - Values: `idle | syncing | error | complete`
   - Expose `lastSyncTime`, `pendingCount`, `failedCount`
   - Wire into `OfflineIndicator.vue` for richer UI feedback

---

## Phase 4: Migrate Pages to Offline-First Pattern

**Depends on Phase 2 — can run parallel with Phase 3**

Replace direct `$apiFetch` calls with offline composable calls in each page:

```ts
// Before (current):
const response = await $apiFetch('/api/v1/farms')
farms.value = response.data

// After:
const { getAll } = useOfflineFarms()
farms.value = await getAll()
```

### Pages (Priority Order)

| # | Page | Change |
|---|---|---|
| 1 | `app/pages/admin/farms/index.vue` | `useOfflineFarms().getAll()` with local filtering/pagination |
| 2 | `app/pages/admin/farms/add.vue` | `useOfflineFarms().save()` — queues if offline |
| 3 | `app/pages/admin/farms/farm/[uuid].vue` | `useOfflineFarms().getOne(uuid)` |
| 4 | `app/pages/admin/index.vue` | Aggregate counts from IDB stores for dashboard |
| 5 | `app/pages/admin/plantings/index.vue` | Complete partial implementation with `useOfflinePlantings()` |
| 6 | `app/pages/admin/farms/farm/new-planting.vue` | Cascading selects from IDB; form queued offline |
| 7 | `app/pages/admin/farms/farm/planting/[uuid].vue` | Planting detail + ledger from IDB |
| 8 | `app/pages/admin/users/index.vue` | Delegate to offline-aware child components |
| 9 | `app/pages/admin/settings/crops/index.vue` | Crops/varieties/treatment types from IDB |
| 10 | `app/pages/admin/settings/system/index.vue` | Ledger accounts from IDB |

---

## Phase 5: Migrate Components to Offline-First Pattern

**Depends on Phase 2 — can run parallel with Phase 3 & 4**

All 12 components with direct API calls get migrated:

| Component | Composable |
|---|---|
| `app/components/farms/farm/tabs/Fields.vue` | `useOfflineFields()` |
| `app/components/farms/farm/tabs/Plantings.vue` | `useOfflinePlantings()` |
| `app/components/farms/farm/tabs/Livestock.vue` | `useOfflineLivestock()` (replace hardcoded mock) |
| `app/components/farms/farm/planting/Harvest.vue` | `useOfflineHarvests()` |
| `app/components/farms/farm/planting/Task.vue` | `useOfflineTasks()` |
| `app/components/farms/farm/planting/Treatment.vue` | `useOfflineTreatments()` |
| `app/components/crops/CropsTab.vue` | `useOfflineCrops()` |
| `app/components/crops/CropVarietyTab.vue` | `useOfflineCrops()` |
| `app/components/crops/TreatmentType.vue` | `useOfflineCrops()` |
| `app/components/users/FarmUsersSection.vue` | `useOfflineUsers()` |
| `app/components/users/PersonnelsSection.vue` | `useOfflineUsers()` |
| `app/components/admin/settings/LedgerAccount.vue` | `useOfflineSettings()` |

**Pattern per component:**
- Import the relevant offline composable + `useOffline()` for `isOnline`
- Replace `$apiFetch(...)` calls with composable methods
- Remove manual CSRF cookie calls (composable handles this)
- Keep existing loading/error UI states

---

## Phase 6: Harden Auth for Offline

**Depends on Phase 1**

### Steps

1. **Cache authenticated user in IndexedDB:**
   - After successful `fetchUser()`, store user object in IDB `cache` store with key `'auth_user'`
   - On app init (`01.auth.ts`), if offline: load user from IDB cache instead of calling API
   - Set `isAuthenticated = true` based on IDB cache + localStorage flag

2. **CSRF token resilience:**
   - After fetching CSRF cookie, cache the token value in IDB with a TTL
   - On reconnect (online event), immediately refresh CSRF before syncing
   - Add CSRF refresh to the start of `syncPendingChanges()`

3. **Auth middleware offline handling:**
   - In `app/middleware/auth.ts`: if offline AND IDB has cached user → allow navigation
   - If offline AND no cached user → redirect to static offline auth page
   - Add new page `app/pages/offline.vue` with instructions

4. **Session re-establishment on reconnect:**
   - When going online, first call `fetchUser()` to verify session
   - If 401/419: notify user to re-login before sync can proceed

5. **Remove legacy `app/composables/useAuth.ts`** — consolidate on auth store

### Files

- `app/stores/auth.ts` — cache user to IDB on login/fetch
- `app/plugins/01.auth.ts` — offline-aware initialization
- `app/middleware/auth.ts` — offline fallback
- `app/composables/useOffline.ts` — CSRF refresh on reconnect
- `app/composables/useAuth.ts` — remove or deprecate
- `app/pages/offline.vue` — new, static offline auth page

---

## Phase 7: Enhance Service Worker & Background Sync

**Depends on Phase 3**

### Steps

1. **Register Workbox Background Sync** in `nuxt.config.ts`:
   - Add `backgroundSync` plugin for API routes
   - Queue name: `farm-sync-queue`
   - Max retention: 48 hours
   - Ensures sync continues even if the browser tab is closed

2. **Caching strategy updates:**
   - Keep `NetworkFirst` for `/api/*` with 10s timeout
   - Add `StaleWhileRevalidate` for read-heavy endpoints (crops list, treatment types)
   - Add `NetworkOnly` for write operations (POST/PUT/DELETE) — they go through sync queue

3. **Periodic sync** (where supported):
   - Register `periodicSync` with minimum interval of 1 hour
   - On periodic sync: pull latest data from server, update IDB

4. **Update PWA manifest:**
   - Add `"handle_links": "preferred"` to keep navigation in-app
   - Ensure all admin routes are covered by `navigateFallback`

### Files

- `nuxt.config.ts` — Workbox config updates

---

## Phase 8: UI/UX Enhancements for Offline

**Depends on Phase 3, 4, 5**

### Steps

1. **Enhance `OfflineIndicator.vue`:**
   - Show sync progress (X of Y items syncing)
   - Show failed sync count with "Retry" button
   - Show last successful sync timestamp
   - Animate during active sync

2. **Per-entity sync badges:**
   - In farm list: show "Not synced" badge on unsynced farms
   - In planting detail: show sync status per section
   - Pattern: `v-if="!entity.synced"` → small orange dot or "Pending sync" chip

3. **Form submission feedback:**
   - When offline: toast "Saved locally. Will sync when online."
   - When online: toast "Saved and synced."
   - Use Shadcn toast or add lightweight notification composable

4. **Conflict resolution UI:**
   - Toast notification when conflicts detected during sync
   - Optional: conflict review page with "keep local" / "keep server" options

5. **Offline search:**
   - Ensure all list pages filter/search over local IDB data (not API)
   - Existing computed filters (`filteredPlantings`, `filteredFarms`) already work — just need IDB data source

---

## Verification Checklist

### Unit Tests
- [ ] Test all IDB helpers with `fake-indexeddb` package — CRUD + sync queue operations
- [ ] Test each composable with mocked `$apiFetch` — verify save writes to IDB + syncQueue, getAll returns IDB data offline, fetches API online

### Manual Tests (Per Page)
- [ ] Load page online → data appears
- [ ] Go offline (DevTools Network → Offline)
- [ ] Reload → data still appears from IDB
- [ ] Create/edit/delete → changes stored locally
- [ ] Go back online → changes sync automatically
- [ ] Check IDB `syncQueue` clears after sync

### Auth Offline Test
- [ ] Log in online → go offline → refresh → still authenticated (IDB cache)
- [ ] Go online → session still valid → sync works

### Conflict Test
- [ ] Edit farm offline → edit same farm on another device → go online → verify server-wins notification

### Service Worker Test
- [ ] Kill browser tab while offline with pending sync items → reopen → items still in queue
- [ ] If Background Sync supported: verify sync fires automatically on reconnect

### PWA Install Test
- [ ] Install PWA → go fully offline → all admin pages load → data operations work

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Conflict strategy | Server-wins with user notification | Simplest for MVP; upgradeable to field-level merge later |
| Sync ordering | Timestamp FIFO with entity-dependency awareness | Farms synced before fields/plantings that reference them |
| Auth offline | Cached user in IDB; re-verify on reconnect | Allows offline navigation without full re-auth |
| IndexedDB library | Raw browser API (no Dexie) | Keeps bundle small; generic helpers cover needs |
| Scope includes | All 13 entity types currently used | Full offline coverage |
| Scope excludes | Inventory (stub, no backend), push notifications, multi-device real-time sync | Not ready / separate concerns |
| Legacy cleanup | Remove `useAuth.ts`, refactor `useOfflineData.ts` → `useOfflineFarms.ts` | Reduce duplication |

---

## Key Files Reference

### Core Infrastructure
- `app/utils/db.ts` — IndexedDB schema and all CRUD helpers
- `app/composables/useOffline.ts` — Online/offline detection + sync engine
- `app/composables/useOfflineData.ts` — Current farm-only offline CRUD (to be refactored)
- `nuxt.config.ts` — PWA/Workbox configuration

### Auth Layer
- `app/stores/auth.ts` — Auth store
- `app/plugins/00.apiFetch.ts` — $apiFetch instance, CSRF handling
- `app/plugins/01.auth.ts` — Auth initialization
- `app/middleware/auth.ts` — Route guard

### Pages (11 files)
- `app/pages/admin/index.vue` — Dashboard
- `app/pages/admin/farms/index.vue` — Farms list
- `app/pages/admin/farms/add.vue` — Add farm
- `app/pages/admin/farms/farm/[uuid].vue` — Farm detail
- `app/pages/admin/plantings/index.vue` — All plantings
- `app/pages/admin/farms/farm/new-planting.vue` — New planting form
- `app/pages/admin/farms/farm/planting/[uuid].vue` — Planting detail
- `app/pages/admin/crops/plantings.vue` — Crop plantings
- `app/pages/admin/users/index.vue` — Users
- `app/pages/admin/settings/crops/index.vue` — Crop settings
- `app/pages/admin/settings/system/index.vue` — System settings

### Components (12 files)
- `app/components/farms/farm/tabs/Fields.vue`
- `app/components/farms/farm/tabs/Plantings.vue`
- `app/components/farms/farm/tabs/Livestock.vue`
- `app/components/farms/farm/planting/Harvest.vue`
- `app/components/farms/farm/planting/Task.vue`
- `app/components/farms/farm/planting/Treatment.vue`
- `app/components/crops/CropsTab.vue`
- `app/components/crops/CropVarietyTab.vue`
- `app/components/crops/TreatmentType.vue`
- `app/components/users/FarmUsersSection.vue`
- `app/components/users/PersonnelsSection.vue`
- `app/components/admin/settings/LedgerAccount.vue`
- `app/components/OfflineIndicator.vue`

---

## Further Considerations

1. **Dexie.js vs raw IndexedDB** — Dexie adds ~15KB but provides a cleaner API and built-in migrations. Stay with raw API unless Phase 1 generic helpers prove unwieldy.

2. **Data volume** — If thousands of plantings/transactions accumulate, IDB queries may slow. Add cursor-based pagination to `getAll()` at the IDB level if needed. Defer until observed.

3. **Multi-user conflicts** — Two users editing the same farm offline create divergent queues. Add a "last synced by" indicator on entities so users see when others modified data.
