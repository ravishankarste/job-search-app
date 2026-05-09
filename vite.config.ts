/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tactical Heartbeat for Build Sync: 2026-05-09 (UI Stabilization)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/tests/**', '**/dist/**'],
  },
  // We now deploy to the root of upanita.app
  base: '/',
})