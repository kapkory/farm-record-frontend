// Read-through cache for reference data (dropdown lists, lookup tables).
//
// Online: fetch, cache in the IndexedDB `cache` store with a TTL, return.
// Offline or on error: return the cached copy (even past its TTL) with
// `stale: true` so forms keep working in the field.
import { db } from '../utils/db'

const DAY = 24 * 60 * 60 * 1000
const DEFAULT_TTL = 7 * DAY

export interface ReferenceResult<T> {
  data: T[]
  /** True when served from cache (offline or API failure) */
  stale: boolean
}

// Central key → endpoint map so callers and cache keys stay consistent.
export const referenceEndpoints = {
  livestock_list: '/api/v1/farms/farm/animals/livestocks/list',
  farm_users: '/api/v1/farms/farm/users/list',
  personnels: '/api/v1/farms/farm/users/personnels/list',
  treatment_types_crop: '/api/v1/settings/crops/treatment-types/list/crop',
  treatment_types_livestock: '/api/v1/settings/crops/treatment-types/list/livestock',
  ledger_accounts: '/api/v1/settings/system/ledgeraccounts/list',
  crops: '/api/v1/settings/crops/list',
  crop_varieties: '/api/v1/settings/crops/varieties/list',
  planting_schedules: '/api/v1/settings/crops/schedules/list',
  animal_types: '/api/v1/settings/animals/animal-types/list',
  animal_groups: '/api/v1/farms/farm/animals/groups/list',
  animal_breeds: '/api/v1/settings/animals/animal-breeds/list',
  breeds: '/api/v1/settings/animals/breeds/list',
  bee_hives: '/api/v1/farms/farm/bees/hives/list',
  farms_list: '/api/v1/farms?all=1'
} as const

export type ReferenceKey = keyof typeof referenceEndpoints

export const useReferenceData = () => {
  const { $apiFetch } = useNuxtApp()
  const { isOnline } = useOffline()

  /**
   * Fetch a reference list through the cache. `key` doubles as the cache
   * key; pass `url` to override the default endpoint (e.g. query params).
   */
  const getReference = async <T = any>(
    key: ReferenceKey | string,
    options: { url?: string, ttl?: number } = {}
  ): Promise<ReferenceResult<T>> => {
    const url = options.url ?? (referenceEndpoints as Record<string, string>)[key]
    if (!url) throw new Error(`Unknown reference key "${key}" and no url given`)

    const readCache = async (): Promise<ReferenceResult<T> | null> => {
      const entry = await db.getCacheEntry(key)
      if (!entry || !Array.isArray(entry.data)) return null
      return { data: entry.data, stale: true }
    }

    if (!isOnline.value) {
      return (await readCache()) ?? { data: [], stale: true }
    }

    try {
      const response = await $apiFetch<any>(url)
      const data: T[] = (Array.isArray(response) ? response : response?.data) ?? []
      await db.setCache(key, data, options.ttl ?? DEFAULT_TTL)
      return { data, stale: false }
    } catch (error) {
      console.error(`Reference fetch failed for "${key}", using cache:`, error)
      return (await readCache()) ?? { data: [], stale: true }
    }
  }

  return { getReference }
}
