import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // Phase 1 tests are pure functions with no DOM. Keeping the node
    // environment avoids pulling in happy-dom, which currently carries a
    // critical VM-context-escape advisory. Add a DOM environment only when
    // component tests actually arrive.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
