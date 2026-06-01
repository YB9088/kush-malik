import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'كوش ملك — مدينة الألعاب',
        short_name: 'كوش ملك',
        description: 'مدينة ألعاب وألغاز وقصص سودانية للصغار والكبار',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#0B1437',
        background_color: '#0B1437',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: { port: 5180, host: '0.0.0.0' },
});
