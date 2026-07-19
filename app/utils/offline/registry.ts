import type { EntityCtx } from '../db'

// Single source of truth mapping each offline-capable entity to its API
// endpoints and parent scoping. Both the sync engine (useOffline) and the
// generic composable factory (useOfflineEntity) read from here — an entity
// missing from this registry cannot be queued or synced.
//
// `ctx` carries parent scoping supplied by the calling page/composable:
//   - animalUuid      breeding parent
//   - eventableUuid   health-record (animal event) parent + eventable_type
//   - taskableUuid    task parent (+ taskableType morph alias)
//   - model           morph alias for treatments/transactions/productions
//                     ('planting' | 'animal' | 'animal_group') — must match
//                     the backend morphMap aliases exactly
//   - parentUuid      the polymorphic parent's uuid
//   - farmUuid        farm scoping for plantings/fields

export interface EntityConfig {
  name: string
  endpoints: {
    list: (ctx: EntityCtx) => string
    create: (ctx: EntityCtx) => string
    show?: (uuid: string, ctx: EntityCtx) => string
    update?: (uuid: string, ctx: EntityCtx) => string
    updateMethod?: 'PUT' | 'PATCH' | 'POST'
    remove?: (uuid: string, ctx: EntityCtx) => string
  }
  /** Value stored in the record's `parent` index for offline list queries */
  parentOf: (ctx: EntityCtx) => string | null
}

export const entityRegistry = {
  farm: {
    name: 'farm',
    endpoints: {
      list: () => '/api/v1/farms?all=1',
      create: () => '/api/v1/farms',
      update: uuid => `/api/v1/farms/${uuid}`,
      remove: uuid => `/api/v1/farms/${uuid}`
    },
    parentOf: () => null
  },

  field: {
    name: 'field',
    endpoints: {
      list: ctx => `/api/v1/farms/fields/list/${ctx.farmUuid ?? ''}`,
      // The create endpoint is an upsert keyed by uuid, so updates POST there too
      create: () => '/api/v1/farms/fields',
      update: () => '/api/v1/farms/fields',
      updateMethod: 'POST',
      remove: uuid => `/api/v1/farms/fields/${uuid}`
    },
    parentOf: ctx => ctx.farmUuid ?? null
  },

  animal: {
    name: 'animal',
    endpoints: {
      list: () => '/api/v1/farms/farm/animals/livestocks/list',
      create: () => '/api/v1/farms/farm/animals',
      show: uuid => `/api/v1/farms/farm/animals/livestocks/${uuid}`,
      update: uuid => `/api/v1/farms/farm/animals/${uuid}`,
      remove: uuid => `/api/v1/farms/farm/animals/${uuid}`
    },
    parentOf: () => null
  },

  animalGroup: {
    name: 'animalGroup',
    endpoints: {
      list: () => '/api/v1/farms/farm/animals/groups/list',
      create: () => '/api/v1/farms/farm/animals/groups'
    },
    parentOf: () => null
  },

  breeding: {
    name: 'breeding',
    endpoints: {
      list: ctx => `/api/v1/farms/farm/animals/breedings/list/${ctx.animalUuid}`,
      create: () => '/api/v1/farms/farm/animals/breedings',
      update: uuid => `/api/v1/farms/farm/animals/breedings/${uuid}`
    },
    parentOf: ctx => ctx.animalUuid ?? null
  },

  // Health records are AnimalEvents on the backend
  animalEvent: {
    name: 'animalEvent',
    endpoints: {
      list: ctx => `/api/v1/farms/farm/animals/events/list/${ctx.eventableUuid}`,
      create: () => '/api/v1/farms/farm/animals/events',
      remove: uuid => `/api/v1/farms/farm/animals/events/${uuid}`
    },
    parentOf: ctx => ctx.eventableUuid ?? null
  },

  task: {
    name: 'task',
    endpoints: {
      list: (ctx) => {
        const base = `/api/v1/tasks/list/${ctx.taskableUuid ?? ''}`
        return ctx.taskableType ? `${base}?taskable_type=${ctx.taskableType}` : base
      },
      create: () => '/api/v1/tasks',
      update: uuid => `/api/v1/tasks/${uuid}`,
      remove: uuid => `/api/v1/tasks/${uuid}`
    },
    parentOf: ctx => ctx.taskableUuid ?? null
  },

  treatment: {
    name: 'treatment',
    endpoints: {
      list: ctx => `/api/v1/farms/farm/crops/treatments/list/${ctx.parentUuid}?model=${ctx.model ?? 'planting'}`,
      create: () => '/api/v1/farms/farm/crops/treatments'
    },
    parentOf: ctx => ctx.parentUuid ?? null
  },

  transaction: {
    name: 'transaction',
    endpoints: {
      list: ctx => `/api/v1/farms/farm/transactions/list/${ctx.model ?? 'planting'}/${ctx.parentUuid}`,
      create: () => '/api/v1/farms/farm/transactions'
    },
    parentOf: ctx => ctx.parentUuid ?? null
  },

  planting: {
    name: 'planting',
    endpoints: {
      list: ctx => `/api/v1/farms/farm/plantings/list/${ctx.farmUuid ?? ''}`,
      create: () => '/api/v1/farms/farm/plantings',
      show: uuid => `/api/v1/farms/farm/planting/${uuid}`
    },
    parentOf: ctx => ctx.farmUuid ?? null
  },

  production: {
    name: 'production',
    endpoints: {
      list: ctx => `/api/v1/farms/farm/productions/list/${ctx.parentUuid}?productionable_type=${ctx.model ?? 'planting'}`,
      create: () => '/api/v1/farms/farm/productions/store'
    },
    parentOf: ctx => ctx.parentUuid ?? null
  },

  // Bee module. Hives are listed unscoped (each record carries apiary_uuid)
  // so one resource instance can serve every apiary; the hive `code` is
  // server-assigned — offline-created hives show a "code pending" state
  // until the queued create syncs.
  hive: {
    name: 'hive',
    endpoints: {
      list: () => '/api/v1/farms/farm/bees/hives/list',
      create: () => '/api/v1/farms/farm/bees/hives',
      show: uuid => `/api/v1/farms/farm/bees/hives/${uuid}`,
      update: uuid => `/api/v1/farms/farm/bees/hives/${uuid}`,
      remove: uuid => `/api/v1/farms/farm/bees/hives/${uuid}`
    },
    parentOf: () => null
  },

  // A harvest session (one POST covering many hives/products). The client
  // uuid doubles as the backend's idempotent session id (trace_number).
  beeHarvest: {
    name: 'beeHarvest',
    endpoints: {
      list: () => '/api/v1/farms/farm/bees/harvests/list',
      create: () => '/api/v1/farms/farm/bees/harvests'
    },
    parentOf: () => null
  },

  // Sales module. Creates are idempotent by client uuid (the backend answers
  // replays from the stored sale). Payments/voids are separate online-only
  // endpoints — they need current server state to validate balances.
  sale: {
    name: 'sale',
    endpoints: {
      list: () => '/api/v1/farms/farm/sales/list',
      create: () => '/api/v1/farms/farm/sales',
      show: uuid => `/api/v1/farms/farm/sales/${uuid}`
    },
    parentOf: () => null
  },

  buyer: {
    name: 'buyer',
    endpoints: {
      list: () => '/api/v1/farms/farm/buyers/list',
      create: () => '/api/v1/farms/farm/buyers'
    },
    parentOf: () => null
  }
} satisfies Record<string, EntityConfig>

export type EntityName = keyof typeof entityRegistry

export function getEntityConfig(entity: string): EntityConfig | undefined {
  return (entityRegistry as unknown as Record<string, EntityConfig>)[entity]
}
