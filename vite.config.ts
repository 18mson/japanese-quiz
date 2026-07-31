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
        theme_color: '#4F46E5',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}']
      }
    })
  ]
})