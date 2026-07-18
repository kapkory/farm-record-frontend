# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Farmconsul — an **offline-first PWA** for farm management (crops, livestock, breeding, plantings, harvests, inventory, users). Nuxt 4 with **hybrid rendering**: the public pages (`/`, `/login`, `/register`, `/pricing`, `/forgot-password`) are prerendered at build time for SEO, while `/admin/**` and token-based auth routes are client-only SPA (`ssr: false` via `routeRules`). Laravel/Sanctum backend. Built mobile-first for use on phones with intermittent connectivity.

## Commands

```bash
npm run dev        # Dev server at http://localhost:3000 (Vite proxied; HMR clientPort=3000)
npm run build      # Production build → .output/ (dist symlinks to .output/public)
npm run preview    # Preview the production build
npm run generate   # Static build used by the Dockerfile — prerenders public pages, SPA shell (200.html) for the rest
```

There is **no test runner, linter, or typecheck script** configured. `postinstall` runs `nuxt prepare` to regenerate `.nuxt/` types. To typecheck manually: `npx nuxi typecheck`.

The backend base URL comes from `NUXT_PUBLIC_API_BASE` (defaults to `https://api.farmconsul.com`). Point it at your local Laravel instance during development.

## Architecture

### Offline-first data flow
Every mutation is **written to IndexedDB first**, queued for sync, then pushed to the API if online. This is handled by a **generic entity layer** — don't hand-roll it per feature:

- **`app/utils/offline/registry.ts`** — the single source of truth mapping each entity to its API endpoints and parent scoping. Both the sync engine and the factory read from it; an entity missing here can't be synced. Polymorphic entities pass their morph alias (`planting`/`animal`/`animal_group`) + parent uuid via `ctx`.
- **`app/composables/useOfflineEntity.ts`** — `useOfflineEntity<T>(entity, ctx)` returns `{ items, loading, fetch, find, create, update, remove }`. Local-first writes with a client-generated uuid (the backend stores it as-is — no id swap), immediate sync attempt when online, 422 rollback with field errors, queue coalescing. Reads are API-first with IndexedDB fallback, overlaying unsynced local rows.
- Per-entity composables (e.g. `app/composables/useAnimalBreedings.ts`) own only form/label state and delegate persistence to the factory. **Mirror `useAnimalBreedings.ts` when adding a feature.**
- **`app/composables/useReferenceData.ts`** — TTL read-through cache for dropdown/lookup lists (assignees, treatment types, ledger accounts, …) so forms work offline.

`OFFLINE-FIRST-GUIDE.md` has the full walkthrough.

### IndexedDB layer — `app/utils/db.ts`
`FarmManageDB` class exported as singleton `db`. DB name `FarmManageDB`, current `DB_VERSION = 3`. One generic **`records`** store keyed by `${entity}:${uuid}` (indexes `entity` and compound `['entity','parent']`) holds server-shaped payloads in an envelope with sync metadata — so **adding an entity needs only a registry entry, not a schema bump.** Plus `syncQueue` and a TTL `cache` store. Only bump `DB_VERSION` when changing the store/index shape itself.

### Sync engine — `app/composables/useOffline.ts`
Module-scoped singleton state (`isOnline`, `pendingSyncCount`, `failedSyncCount`, `authRequired`, `triggerSync`) and the replay loop. It drains `syncQueue` FIFO, building each request from the registry. **New syncable entities just need a registry entry** — no switch to edit. 401 pauses the queue until re-login; 422/404 mark the item `failed` and user-discardable (not silently dropped); network/5xx retry with an attempt cap.

### API client — `app/plugins/00.apiFetch.ts`
Provides `nuxtApp.$apiFetch` (typed in `app.d.ts`). A `$fetch` instance with `credentials: 'include'`, `Accept: application/json`, and an `onRequest` hook that reads the `XSRF-TOKEN` cookie and sets `X-XSRF-TOKEN`. All non-local `http://` URLs are force-upgraded to `https://`. **Always `await $apiFetch('/sanctum/csrf-cookie')` before a state-changing request.**

### Auth — two coexisting systems (be careful)
- **`app/stores/auth.ts`** (Pinia) is the source of truth for the session. Uses `$apiFetch` against `/login`, `/logout`, `/register`, `/api/user`. Exposes `isLoggedIn`, `isInitialized`, `initialize()`. Booted client-side by `app/plugins/01.auth.ts`.
- **`app/composables/useAuth.ts`** talks to the same endpoints but with **`axios` directly** (legacy). Some pages use this instead of the store.

Route guards: `middleware/auth.ts` (protected — calls `authStore.initialize()` then redirects to `/login`) and `middleware/guest.ts` (redirects logged-in users to `/admin`). Guards effectively run client-side only (`auth.ts` skips on server; there is never a session at prerender time). **Public pages must stay SSR-safe** — no browser APIs outside `onMounted`/`import.meta.client` guards, since they execute in Node during `nuxt generate`.

### Routing & layouts
File-based routing under `app/pages/`. Admin app lives under `app/pages/admin/**` and uses `layout: 'admin'` + `middleware: 'auth'`. Public pages (`index`, `login`, `register`, `pricing`, `forgot-password`) use the default/`app` layout. Dynamic routes use `[uuid]` / `[token]` params.

### UI
- Components auto-imported from `app/components/` with **no path prefix** (`pathPrefix: false`) — use the bare component name regardless of subfolder. Feature components are grouped: `animals/`, `crops/`, `farms/`, `users/`, `admin/`.
- `app/components/ui/` holds hand-rolled shadcn-style primitives (Button, Card, Input, Label). Icons via `lucide-vue-next`.
- Tailwind (`@nuxtjs/tailwindcss` + `@tailwindcss/forms`); global CSS `app/assets/css/main.css`. Primary color green `#10B981`. No scoped CSS convention — use Tailwind utilities.

### PWA
Configured entirely in `nuxt.config.ts` under `pwa` (`@vite-pwa/nuxt`, `registerType: 'autoUpdate'`, `strategies: 'generateSW'`, service worker `sw.js`). Workbox runtime caching: NetworkFirst for `/api/**`, CacheFirst for images. `navigateFallback: null` because Nginx handles SPA routing. PWA is enabled in dev (`devOptions.enabled`).

## Conventions
- Path alias `~/*` maps to project root; app code lives under `app/` (Nuxt 4 `srcDir`).
- Composables named `use*`, return an object of refs/functions; instantiate at component setup.
- Backend responses are wrapped in `{ data: ... }`; unwrap accordingly.
- Server records use snake_case + `uuid`/`created_at`; local IndexedDB records use `id`/`createdAt` + `synced`. Map between them at the composable boundary (see `fetchBreedings`).

## Reference
- `OFFLINE-FIRST-GUIDE.md` — deeper walkthrough of the offline/PWA design (registry + factory + sync engine).
- `.github/copilot-instructions.md` — overlapping guidance (note: partly stale, e.g. old API base and farm-only scope).

Settings CRUD screens (`app/components/crops/*`, `app/components/animals/*Tab.vue`, ledger accounts) remain **online-only** by design; their reference lists are cached via `useReferenceData` and shown offline through the field forms that consume them.
