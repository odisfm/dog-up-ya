import { defineConfig } from 'vite'
import { execSync } from 'child_process'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '../',
  server: {
    cors: false,
    host: true,
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(execSync('git rev-parse HEAD').toString().trim()),
  }
})
