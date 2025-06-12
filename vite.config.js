import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns:['**/*.{js,css,html,ico,png,svg,json,svelte,woff,woff2}'],
      },
      manifest: {
        name: 'Gozinta Cash Flow',
        short_name: 'Gozinta',
        description: 'An app to visualize cash flow',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png', // You'd place this in your public folder
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', // You'd place this in your public folder
            sizes: '512x512',
            type: 'image/png',
          },{
            src: 'pwa-maskable-512x512.png', // You'd place this in your public folder
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
      },
      })
    ]
    })