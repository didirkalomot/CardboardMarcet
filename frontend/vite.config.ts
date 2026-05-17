import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Никаких лишних прокси. Frontend стучится напрямую на http://localhost:3000,
  // как это настроено в вашем api.ts. Это современный стандарт.
})