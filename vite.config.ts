import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Use /math-game-for-kids/ for GitHub Pages, / for Vercel
const base = process.env.GITHUB_PAGES ? '/math-game-for-kids/' : '/';

export default defineConfig({
  base,
  server: {
    allowedHosts: ['host.docker.internal'],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['sprites/**/*', 'fonts/*', 'sounds/*'],
      manifest: {
        name: 'Pokemon Math Adventure',
        short_name: 'Math Pokemon',
        description: 'Learn math by catching Pokemon!',
        theme_color: '#E3350D',
        background_color: '#F8F0E0',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,woff2,mp3,ogg}'],
      }
    })
  ],
})
