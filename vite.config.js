import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Falha o build de produção se faltar uma env obrigatória (sem default silencioso).
const requireBuildEnv = () => ({
  name: 'require-build-env',
  configResolved(config) {
    if (config.command !== 'build') return
    for (const k of ['VITE_API_BASE_URL', 'VITE_SITE_TOKEN']) {
      if (!config.env[k]) throw new Error(`Env em falta no build: ${k}`)
    }
  },
})

export default defineConfig({
  server: {
    historyApiFallback: true,
  },
  plugins: [
    requireBuildEnv(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['logo.png'],
      manifest: {
        name: 'Barbearia Tiago Fernandes',
        short_name: 'Tiago Barbeiro',
        description: 'Agendamento online — Barbearia Tiago Fernandes, Braga',
        theme_color: '#212121',
        background_color: '#212121',
        display: 'standalone',
        start_url: '/',
        lang: 'pt',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Web Push do cliente (push + notificationclick) em public/push-sw.js
        importScripts: ["push-sw.js"],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
