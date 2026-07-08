import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/portfolio/',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3103,
    host: true,
    proxy: {
      '/portfolio/api': {
        target: 'http://localhost:3104',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/portfolio\/api/, '/api'),
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
