// Type declarations for Nuxt app

import type { $Fetch } from 'ofetch'

declare module '#app' {
  interface NuxtApp {
    $apiFetch: $Fetch
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $apiFetch: $Fetch
  }
}

export {}
