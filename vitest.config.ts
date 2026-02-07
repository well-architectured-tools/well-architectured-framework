import { defineConfig } from 'vitest/config';
import { NovadiUnplugin } from '@novadi/core/unplugin';

export default defineConfig({
  test: {
    watch: false,
    passWithNoTests: true,
    mockReset: true,
    projects: [
      {
        plugins: [NovadiUnplugin.vite({ enableAutowiring: true })],
        test: {
          name: 'unit-tests',
          include: ['src/**/*.test.ts'],
          environment: 'node',
          sequence: {
            concurrent: true,
          },
        },
      },
    ],
  },
});
