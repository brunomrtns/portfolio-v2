import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3103,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3104',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: './dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'motion-vendor': ['framer-motion'],
          'gsap-vendor': ['gsap'],
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
});
