import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const appVersion = 'v0.2'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: `Simply Weather`,
        short_name: `Simply Weather`,
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
