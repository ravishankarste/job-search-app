import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // We keep the base path for production deployment to Hostinger subdirectory
  base: process.env.NODE_ENV === 'production' ? '/jobs/' : '/',
})