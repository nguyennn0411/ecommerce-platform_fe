import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Gateway is not ready yet, so product UI calls its owning services directly.
      '/api/v1/products': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/categories': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/inventory': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/orders': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
    },
  },
})
