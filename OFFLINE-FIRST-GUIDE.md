# Offline-First Implementation Guide

This Nuxt 4 application is now configured as an offline-first Progressive Web App (PWA). Here's how it works and how to use it:

## Features

### 1. **Service Worker & Caching**
- Automatic caching of static assets (JS, CSS, images)
- API responses cached for offline access
- Smart cache strategies:
  - **CacheFirst**: Fonts, static assets (1 year)
  - **NetworkFirst**: API calls, pages (24 hours)
  - Network timeout fallback to cache

### 2. **IndexedDB Storage**
The app uses IndexedDB for local data persistence:

**Stores:**
- `farms` - Farm data with sync status
- `syncQueue` - Pending changes to sync when online
- `cache` - General purpose cache with TTL

**Location:** `/utils/db.ts`

### 3. **Offline Detection**
Real-time network status monitoring with automatic sync when back online.

**Composable:** `useOffline()`
```ts
const { 
  isOnline,           // Current network status
  lastOnline,         // Last time online
  pendingSyncCount,   // Number of pending syncs
  triggerSync         // Manual sync trigger
} = useOffline()
```

### 4. **Offline Data Operations**
All CRUD operations work offline and sync automatically.

**Composable:** `useOfflineData()`
```ts
const { 
  saveFarm,      // Create/update farm (works offline)
  getFarms,      // Get all farms (local-first)
  deleteFarm,    // Delete farm (queued for sync)
  cacheData,     // Cache any data with TTL
  getCachedData  // Retrieve cached data
} = useOfflineData()
```

### 5. **Visual Indicators**
- **Yellow banner**: Offline mode (shows pending sync count)
- **Green banner**: Back online (sync successful)
- Auto-hides after 3 seconds

## How to Use

### Basic Usage

1. **Save Data Offline:**
```ts
const { saveFarm } = useOfflineData()

// Works whether online or offline
await saveFarm({
  name: 'Green Valley Farm',
  location: 'California',
  size: '100 acres',
  type: 'Organic',
  owner: 'John Doe',
  status: 'active'
})
```

2. **Fetch Data:**
```ts
const { getFarms } = useOfflineData()

// Always returns data (from cache if offline)
const farms = await getFarms()
```

3. **Delete Data:**
```ts
const { deleteFarm } = useOfflineData()

// Queued for sync if offline
await deleteFarm('farm-id-123')
```

### Advanced Usage

**Manual Sync:**
```ts
const { triggerSync } = useOffline()

// Force sync pending changes
triggerSync()
```

**Cache with TTL:**
```ts
const { cacheData, getCachedData } = useOfflineData()

// Cache for 1 hour
await cacheData('dashboard-stats', statsData, 3600)

// Retrieve cached data
const stats = await getCachedData('dashboard-stats')
```

**Check Sync Status:**
```ts
const { pendingSyncCount, updatePendingCount } = useOffline()

await updatePendingCount()
console.log(`${pendingSyncCount.value} items pending sync`)
```

## Installation

The PWA is already configured. To install as an app:

1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Or: Settings menu → "Install FarmManage..."

## PWA Configuration

**File:** `nuxt.config.ts`

Key settings:
- Auto-update service worker
- Manifest with green theme (#10B981)
- Workbox caching strategies
- Dev mode enabled for testing

## Testing Offline Mode

### In Browser (Chrome DevTools):

1. Open DevTools (F12)
2. Go to **Network** tab
3. Change throttling to **Offline**
4. Try creating/editing farms
5. Go back **Online** - watch auto-sync

### In Browser (Application tab):

1. Open DevTools → **Application** tab
2. Check **Service Workers** - should see active worker
3. Check **IndexedDB** - see FarmManageDB with stores
4. Check **Cache Storage** - see cached assets

## File Structure

```
frontend/
├── nuxt.config.ts              # PWA configuration
├── utils/
│   └── db.ts                   # IndexedDB wrapper
├── composables/
│   ├── useOffline.ts           # Network detection & sync
│   └── useOfflineData.ts       # Offline data operations
├── components/
│   └── OfflineIndicator.vue    # Visual offline indicator
└── public/
    ├── icon-192x192.png        # PWA icon (small)
    ├── icon-512x512.png        # PWA icon (large)
    ├── icon-maskable-192x192.png
    └── icon-maskable-512x512.png
```

## Customization

### Add New Entity Types

1. Add type to `db.ts`:
```ts
export interface Crop {
  id: string
  name: string
  // ... other fields
  synced: boolean
}
```

2. Add object store in `init()`:
```ts
if (!db.objectStoreNames.contains('crops')) {
  const cropStore = db.createObjectStore('crops', { keyPath: 'id' })
  cropStore.createIndex('name', 'name', { unique: false })
}
```

3. Add CRUD methods to `db.ts`

4. Add entity operations to `useOfflineData()`

### Connect to Real API

Replace the commented API calls in `useOfflineData.ts`:

```ts
// Replace this:
console.log('Farm saved online:', farmData)

// With this:
const response = await $fetch('/api/farms', {
  method: 'POST',
  body: farmData
})
```

### Modify Cache Strategy

Edit `nuxt.config.ts` → `pwa.workbox.runtimeCaching`:

```ts
{
  urlPattern: /\/api\/farms.*/,
  handler: 'NetworkFirst',  // Change strategy
  options: {
    cacheName: 'farms-cache',
    expiration: {
      maxAgeSeconds: 60 * 60  // Change TTL
    }
  }
}
```

## Sync Behavior

**Automatic Sync:**
- Triggers when app goes from offline → online
- Processes all items in sync queue
- Retries failed syncs on next connection
- Cleans up successfully synced items

**Sync Queue Priority:**
- FIFO (First In, First Out)
- Failed syncs remain in queue
- Manual `triggerSync()` available

## Best Practices

1. **Always use composables** for data operations
2. **Check `isOnline`** before showing "sync now" buttons
3. **Show `pendingSyncCount`** to users
4. **Handle sync failures** gracefully
5. **Test offline scenarios** thoroughly
6. **Set appropriate cache TTLs** for your data
7. **Clear old cache** periodically

## Troubleshooting

**Service worker not updating?**
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Clear site data in DevTools
- Check console for service worker errors

**Data not syncing?**
- Check browser console for errors
- Verify `syncQueue` in IndexedDB
- Call `updatePendingCount()` to refresh count

**PWA not installing?**
- Ensure you're on HTTPS (or localhost)
- Check manifest.json is generated
- Icons must be correct format/size

## Next Steps

1. **Connect real API endpoints** in sync logic
2. **Add authentication** token handling for offline
3. **Implement conflict resolution** for concurrent edits
4. **Add background sync** for better reliability
5. **Create admin dashboard** for sync monitoring
6. **Add push notifications** for sync status

## Resources

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
