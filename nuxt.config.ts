// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/hints',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],
  runtimeConfig:{
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://farm-app-backend.test'
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Farm Management System',
      short_name: 'FarmManage',
      description: 'Offline-first farm management application',
      theme_color: '#10B981',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/admin',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-maskable-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/icon-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/admin',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200]
            },
            networkTimeoutSeconds: 10
          }
        },
        {
          urlPattern: /\/_nuxt\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'nuxt-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
            }
          }
        },
        {
          urlPattern: /\/admin.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            },
            networkTimeoutSeconds: 3
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600 // Check for updates every hour
    },
    devOptions: {
      enabled: false,
      type: 'module'
    }
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        // When Nuxt proxies Vite (Nuxt runs on :3000 and Vite on :5173),
        // set clientPort so the browser HMR client connects back to the proxy port.
        // This prevents ws connections attempting to reach 5173 directly.
        clientPort: 3000
      }
    }
  }
})