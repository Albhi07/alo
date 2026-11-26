/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'আলো — SSC প্রস্তুতি',
        short_name: 'আলো',
        description: 'Free, offline-first SSC learning for Bangladeshi students',
        lang: 'bn',
        theme_color: '#14213d',
        background_color: '#14213d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell: all built JS/CSS/HTML plus Bengali+Latin font subsets.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Sign-in and sync only run online, so supabase-js is fetched when needed.
        globIgnores: ['**/supabase-*.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Lesson packs, audio and images downloaded on demand (M3).
            urlPattern: /\/content\//,
            handler: 'CacheFirst',
            options: { cacheName: 'alo-content', expiration: { maxEntries: 2000 } },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2019',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          dexie: ['dexie', 'dexie-react-hooks'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
