# Copilot Instructions - Farm App Frontend

## Project Overview
Nuxt 4 offline-first PWA for farm management. The architecture prioritizes local-first data operations with automatic sync to Laravel backend (Sanctum auth). SSR disabled (`ssr: false`), targeting progressive web app capabilities.

## Critical Architecture Patterns

### 1. Offline-First Data Layer
**Files:** `app/utils/db.ts`, `app/composables/useOfflineData.ts`, `app/composables/useOffline.ts`

All data operations happen locally-first in IndexedDB with async sync queue:
- `saveFarm()` → stores in IndexedDB + adds sync task
- `getFarms()` → reads from local DB first, updates if online
- Sync happens automatically when network returns; manual trigger via `triggerSync()`

**Key distinction:** Sync queue tracks actions by entity type (`farm|crop|livestock|inventory`) and state (`synced: true/false`).

### 2. Authentication Flow
**Files:** `app/stores/auth.ts`, `app/composables/useAuth.ts`, `app/plugins/01.auth.ts`, `app/middleware/auth.ts`

- Uses Laravel Sanctum (CSRF token in cookie)
- Token extracted dynamically on each API request via `plugin/00.apiFetch.ts`
- Auth store initializes on app boot; pages/routes have `middleware: ['auth']`
- Routes: `/login`, `/register`, `/forgot-password` (guest-only); `/admin/*` (protected)

**Important:** CSRF handling is manual (reads from document.cookie). Both `X-XSRF-TOKEN` and `X-CSRF-TOKEN` headers set to match varying backend expectations.

### 3. Component & UI Library
- **UI components:** Shadcn-Nuxt (pre-built: Button, Card, Input, Label in `app/components/ui/`)
- **Icons:** Lucide Vue Next
- **Styling:** Tailwind CSS + @tailwindcss/forms
- **Theme color:** #10B981 (green, matches PWA manifest)

### 4. API Integration
**File:** `app/plugins/00.apiFetch.ts`

- Custom $fetch instance injected as `nuxtApp.$apiFetch`
- Credentials included by default; CSRF token auto-attached
- Base URL: `runtimeConfig.public.apiBase` (defaults to `https://farm-app-backend.test`)
- Network timeout falls back to cached response (service worker)

**Auth store usage:** All API calls within store actions use `nuxtApp.$apiFetch`

### 5. State Management
- **Pinia store** at `app/stores/auth.ts` (single source of truth for user session)
- Composables (`useOfflineData`, `useOffline`) handle local UI state
- No global data store for farms—each page component manages local state via composables

## Development Workflows

### Build & Run
```bash
npm run dev         # Start dev server (http://localhost:3000)
npm run build       # Nuxt build (bundles app)
npm run generate    # SSG (not used; SSR disabled)
npm run preview     # Preview production build locally
```

### Testing Offline Mode
1. Open DevTools → **Network** tab
2. Set throttling to **Offline**
3. Verify sync queue is populated in IndexedDB (DevTools → **Application** → **IndexedDB** → FarmManageDB)
4. Go back **Online** → watch sync queue clear (manual triggerSync() if needed)

### PWA Installation
- Chrome/Edge: Click install icon in address bar
- Service worker auto-updates (configured in `nuxt.config.ts`: `registerType: 'autoUpdate'`)

## Project-Specific Conventions

### File Organization
- **Pages:** `app/pages/` (route = file path)
  - `/admin` routes use `middleware: ['auth']` and `layout: 'admin'`
  - `/`, `/login`, `/register` use default layout
- **Composables:** Always destructure return; use `const { isOnline } = useOffline()`
- **Stores:** Single Pinia store (`auth`); prefer composables for feature-specific logic

### Naming
- Composables: `use*` (e.g., `useAuth`, `useOfflineData`)
- Database methods: Verb + noun (e.g., `addFarm`, `getFarm`, `markSynced`)
- Sync queue action types: literal union `'create' | 'update' | 'delete'`

### Data Structures
**Farm schema (IndexedDB):**
```ts
interface Farm {
  id: string          // UUID, auto-generated if omitted
  name: string
  location: string
  size: string
  type: string
  owner: string
  status: 'active' | string
  createdAt: ISO string
  updatedAt: ISO string
  synced: boolean     // Marks if backend in sync
}
```

**SyncQueue schema:**
```ts
interface SyncQueue {
  id: string
  action: 'create' | 'update' | 'delete'
  entity: 'farm' | 'crop' | 'livestock' | 'inventory'
  data: any           // Full entity data
  timestamp: number
  synced: boolean     // Marks if API call succeeded
}
```

### Error Handling Pattern
- Auth store: Errors set on `error` ref, exposed via `authError` computed
- Offline ops: Errors logged; operations fail silently if offline (UI shows banner)
- API failures: Logged to console; sync queue retried on next online event

### Styling Defaults
- Use Tailwind classes directly; no scoped CSS
- Use Shadcn components for consistency (Button, Card, Input, etc.)
- Green (#10B981) for primary, grey (#6B7280) for secondary
- Mobile-first: `sm:`, `md:` breakpoints for responsive design

## Integration Points & Dependencies

### External Services
- **Laravel backend:** NUXT_PUBLIC_API_BASE env var (Sanctum auth, CORS required)
- **Service Worker:** Workbox (auto-caching via `@vite-pwa/nuxt`)
- **IndexedDB:** Browser-native, initialized on first use

### Build Dependencies
- **Nuxt 4.2.1**: Framework, SSR disabled
- **Vue 3.5.24**: UI framework
- **Pinia 3.0.4**: State management
- **Axios**: HTTP client in auth composables (legacy, coexists with $fetch)

## Common Tasks

### Adding a New Page
1. Create `app/pages/admin/feature/index.vue`
2. Add `middleware: ['auth']` and `layout: 'admin'` if protected
3. Import composables: `const { isOnline } = useOffline()`
4. Fetch local data in `onMounted` hook using `useOfflineData()`

### Adding a New Data Type (e.g., Crops)
1. Extend `app/utils/db.ts`: Add `Crop` interface, `addCrop()`, `getCrops()` methods
2. Create `app/composables/useCropData.ts` mirroring `useOfflineData` pattern
3. Update sync queue entity types: `'farm' | 'crop' | 'livestock' | 'inventory'`
4. Backend must implement corresponding API endpoints

### Debugging Offline Sync
1. Open **DevTools** → **Application** → **IndexedDB** → **FarmManageDB**
2. Check `syncQueue` store for unsent items
3. Verify `farm.synced == false` for unsynced farms
4. Call `triggerSync()` in console: `$nuxt.useOffline().triggerSync()`

## Key Files to Review
- **app/utils/db.ts** — IndexedDB schema and operations
- **app/composables/useOfflineData.ts** — CRUD + cache layer
- **app/composables/useAuth.ts** — Login/register/password reset
- **app/stores/auth.ts** — Session state + initialization
- **app/plugins/00.apiFetch.ts** — API client setup
- **nuxt.config.ts** — PWA + Tailwind + module setup
- **OFFLINE-FIRST-GUIDE.md** — Detailed offline patterns
