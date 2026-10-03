import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // JourneyCanvas is a separately lazy-loaded Three.js scene; allow its small vendor chunk overhead.
    chunkSizeWarningLimit: 512,
  },
})
