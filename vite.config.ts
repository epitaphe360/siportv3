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
      port: 5000,
      overlay: false
    },
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'icons-vendor': ['lucide-react'],
          'radix-vendor': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-slot'
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-avatar',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slot'
    ],
  },
});
