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
