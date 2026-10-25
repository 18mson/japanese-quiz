import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: true, // expose ke jaringan lokal (0.0.0.0)
    port: 5173,
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Nihongo Master: Typing & Vocab Battleground',
        short_name: 'NihongoMaster',
        description: 'Master Japanese Kana, N5 Vocab & Realtime Typing Battleground',
        theme_color: '#312E81',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        globIgnores: ['**/kanjiInfo*.*', '**/assets/kanjiInfo-*.js'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/kanjiInfo-[^/]+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kanji-info-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      }
    })
  ]
})