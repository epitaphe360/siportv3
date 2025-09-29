import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      clientPort: 5000,
    },
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
            if (id.includes('node_modules/@supabase')) return 'supabase-vendor';
            if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
            return 'vendor';
          }
          if (id.endsWith('src/types') || id.includes('/src/types/')) return 'types';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
