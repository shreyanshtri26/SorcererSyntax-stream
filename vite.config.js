import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['logo.png', 'tabicon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Room no: 305 | Premium Cinema',
        short_name: 'Room 305',
        description: 'A modern React streaming/music/movie hub.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        // Only precache/cache static build assets. Live streams and API calls
        // (TMDB, IPTV, streaming providers) must always hit the network.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // vosk-browser's WASM speech-recognition bundle is >2MB and is only
        // ever lazy-loaded on demand (offline voice-search fallback) — it
        // must not be part of the eagerly precached app shell.
        globIgnores: ['**/vosk-*.js'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => ['style', 'script', 'worker', 'font'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-assets' },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
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
