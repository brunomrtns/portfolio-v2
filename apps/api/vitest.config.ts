import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**', 'src/server.ts'],
    },
  },
  resolve: {
    alias: {
      '@portfolio/shared': new URL('../../packages/shared/src/index.ts', import.meta.url).pathname,
      '@portfolio/types': new URL('../../packages/types/src/index.ts', import.meta.url).pathname,
    },
  },
});
