import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Vou Lá - Dourados',
          short_name: 'Vou Lá',
          description: 'Descubra os melhores rolês de Dourados em tempo real.',
          theme_color: '#ccff00',
          background_color: '#0E1121',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'https://api.dicebear.com/7.x/initials/svg?seed=VL&backgroundColor=ccff00&fontFamily=Arial&fontWeight=900',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: 'https://api.dicebear.com/7.x/initials/svg?seed=VL&backgroundColor=ccff00&fontFamily=Arial&fontWeight=900',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
