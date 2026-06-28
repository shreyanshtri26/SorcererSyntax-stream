import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    proxy: {
      '/api/cinemaos': {
        target: 'https://cinemaos.live',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cinemaos/, '/api/channels')
      }
    }
  }
})
