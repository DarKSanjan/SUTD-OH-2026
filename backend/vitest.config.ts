import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Run tests sequentially to avoid deadlocks
      },
    },
    setupFiles: './src/test/setup.ts',
    testTimeout: 30000, // 30 seconds for property-based tests
    env: {
      NODE_ENV: 'test',
    },
  },
});
