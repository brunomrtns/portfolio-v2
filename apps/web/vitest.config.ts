import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/__tests__/**', 'src/main.tsx', 'src/index.css', 'src/i18n/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@portfolio/shared': path.resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
      '@portfolio/types': path.resolve(import.meta.dirname, '../../packages/types/src/index.ts'),
    },
  },
});
