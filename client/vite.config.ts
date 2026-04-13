import { defineConfig } from 'vite'
import { execSync } from 'child_process'
import { VitePWA } from 'vite-plugin-pwa'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'dog up ya',
        short_name: 'dog up ya',
        description: 'Footy scores and fxitures',
        theme_color: '#67797D',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  envDir: '../',
  server: {
    cors: false,
    host: true,
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(execSync('git rev-parse HEAD').toString().trim()),
  }
})
