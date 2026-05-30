import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/kps/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'КПС Курс — 30 дней',
        short_name: 'КПС Курс',
        description: '30-дневная программа для КПС, подвижности таза и растяжки',
        start_url: '/kps/',
        display: 'standalone',
        background_color: '#1a1814',
        theme_color: '#1a1814',
        orientation: 'portrait-primary',
        lang: 'ru',
        icons: [
          { src: 'icons/icon-72.png',  sizes: '72x72',   type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-96.png',  sizes: '96x96',   type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
})
