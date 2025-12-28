import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
      /* sentryVitePlugin({
        org: 'vou-la',
        project: 'react-native',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        // Adjust the URL prefix if your source maps are uploaded to a different location

        // Enable source map upload for production builds
        // sourcemaps: { include: ['dist/ ** /*.js'] },
        // Optional: set debug to true for verbose logging during CI
        debug: false,
      }), */
      VitePWA({
        registerType: 'prompt', // Notify user about updates
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              // Supabase API - Network First (always try network, fallback to cache)
              urlPattern: /^https:\/\/qfqazksheoovpwquhcjo\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60 // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Map tiles - Cache First (use cache, fallback to network)
              urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'map-tiles',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                }
              }
            },
            {
              // Images - Cache First
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
                }
              }
            },
            {
              // Google Fonts - Cache First
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
                }
              }
            },
            {
              // Font files - Cache First
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
                }
              }
            }
          ],
          navigateFallback: '/offline.html',
          navigateFallbackDenylist: [/^\/api/]
        },
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
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    // Removed GEMINI_API_KEY from client bundle for security
    // All Gemini API calls now go through /api/gemini-proxy
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {

        }
      }
    }
  };
});
