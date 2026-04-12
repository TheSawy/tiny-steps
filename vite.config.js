import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Tiny Steps',
        short_name: 'Tiny Steps',
        description: 'Baby tracker for Marwan',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [
          /^\/__\/.*/,
          /firebaseapp\.com/,
          /firebaseio\.com/,
          /firestore\.googleapis\.com/,
          /identitytoolkit\.googleapis\.com/,
          /securetoken\.googleapis\.com/,
          /googleapis\.com/,
          /gstatic\.com/,
        ],
        runtimeCaching: [],
        navigateFallback: null,
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
});