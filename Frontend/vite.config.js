import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirect all API requests to Laravel
      '/api': {
        target: 'http://localhost:8000', // Laravel backend
        changeOrigin: true,
        secure: false,
      },
      // Proxy other Laravel routes (if needed)
      '/sanctum': 'http://localhost:8000', // For Laravel Sanctum
    },
  },
});
