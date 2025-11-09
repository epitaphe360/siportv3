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
    port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
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
          'router-vendor': ['react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          'icons-vendor': ['lucide-react'],
          'radix-vendor': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-slot'
          ],
          'charts-vendor': ['recharts'],
          'utils-vendor': ['zustand', 'clsx', 'tailwind-merge']
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    reportCompressedSize: false,
    cssCodeSplit: true,
    // Ensure proper cache busting with content-based hashing
    assetsInlineLimit: 0
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
