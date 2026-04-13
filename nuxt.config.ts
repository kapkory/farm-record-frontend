// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      title: 'Farmconsul — Smart Farm Management',
      meta: [
        { name: 'theme-color', content: '#10B981' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Farmconsul' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ]
    }
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],
  runtimeConfig:{
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.farmconsul.com'
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    // Use the same filename as the old @nuxtjs/pwa-generated file so the
    // next deployment overwrites the stale HTTP-URL service worker.
    filename: 'sw.js',
    strategies: 'generateSW',
    injectRegister: 'auto',
    scope: '/',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png'],
    manifest: {
      name: 'Farmconsul — Smart Farm Management',
      short_name: 'Farmconsul',
      description: 'Track crops, manage workers, record harvests — all from your phone. Built for African farmers.',
      theme_color: '#10B981',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
          purpose: 'any'
        }
      ]
    },
    workbox: {
      // Precache all built assets
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      // Don't precache index.html since Nginx handles SPA routing
      navigateFallback: null,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/farmconsul\.com\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400,
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\.farmconsul\.com\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 86400,
            },
            networkTimeoutSeconds: 10,
          },
        },
        // Cache images
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            }
          }
        }
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600 // Check for updates every hour
    },
    devOptions: {
      enabled: true, // Enable in dev to test PWA
      type: 'module',
      navigateFallback: undefined,
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