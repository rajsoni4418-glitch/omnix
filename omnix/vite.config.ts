import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt'],
        manifest: {
          name: 'Omnix',
          short_name: 'Omnix',
          description: 'A robust, high-performance community platform',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        }
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-icons': ['lucide-react'],
            'vendor-motion': ['motion', 'motion/react'],
            'vendor-charts': ['recharts'],
            'vendor-supabase': ['@supabase/supabase-js'],
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      watch: {
        usePolling: true,
      }
    },
  };
});
