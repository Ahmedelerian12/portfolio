import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dummy website - runs on port 3002, no backend proxy needed
export default defineConfig({
  plugins: [react()],
  base: '/demo/',
  server: {
    host: '0.0.0.0',
    port: 3002,
    strictPort: false,
    // No proxy needed - all data is dummy/local
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
