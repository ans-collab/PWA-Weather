import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Simply Weather v0.1',
        short_name: 'Simply Weather',
        description: 'Get your weather. Nothing more, nothing less.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#285bae',
        theme_color: '#285bae',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    port: 5174,
  }
})
