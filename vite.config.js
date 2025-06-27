import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import sveltePreprocess from 'svelte-preprocess';
import { optimizeImports, optimizeCss} from 'carbon-preprocess-svelte';
import path from 'path'; 


const repositoryName = 'gozinta'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      preprocess: [
        optimizeImports(), // Handles Carbon component import optimization
        sveltePreprocess({ // Handles general SCSS, TypeScript, PostCSS, etc.
          scss: {
            // If you need to specify includePaths for Sass to find @carbon/styles,
            // you can do it here. However, direct npm package imports in SCSS
            // usually work if `sass` is correctly resolving node_modules.
          includePaths: [path.resolve('./node_modules')],
          },
        })
      ]
  }),
    optimizeCss(),
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
        scope: '/gozinta/',
        start_url: '/gozinta/',
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
