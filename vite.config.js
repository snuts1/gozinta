import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

const repositoryName = 'gozinta'

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
            src: 'icons/gg-192x192.png', // You'd place this in your public folder
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/gg-512x512.png', // You'd place this in your public folder
            sizes: '512x512',
            type: 'image/png',
          },{
            src: 'icons/gg-maskable-512x512.png', // You'd place this in your public folder
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/Screenshot 2025-06-14 110408.png', // Path relative to your public folder
            sizes: '454x835', // Actual size of your screenshot
            type: 'image/png',
            label: 'Main view of the Gozinta app'
          }
        ]
      },
      })
    ],
    base: `/${repositoryName}/`,
    })
