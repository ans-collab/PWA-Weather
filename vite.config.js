import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const appVersion = 'v0.2.1'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/v1\/forecast/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.pexels\.com\/v1\/search/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pexels-api',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/images\.pexels\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pexels-images',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/(search|reverse)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'geocoding',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
      manifest: {
        name: `Forecast`,
        id: `Forecast`,
        short_name: `Forecast`,
        description: 'This is your local weather app with no ads, no fuss, no mess. It just works. It nothing nothing more, and nothing less. Expect incremental updates for added enhancements.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#FFFFFF',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ],
        orientation: 'portrait',
        categories: ['weather', 'utilities', 'productivity'],
        screenshots: [
          {
            src: '/screenshots/weather-desktop.png',
            sizes: '2048x996',
            type: 'image/png',
            label: 'Desktop Weather Details Screen'
          },
          {
            src: '/screenshots/weather-mobile.png',
            sizes: '1031x1056',
            type: 'image/png',
            label: 'Mobile Weather Details Screen'
          }
        ]
      }
    })
  ],
  server: {
    port: 5174,
  }
})
