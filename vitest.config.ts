import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    passWithNoTests: true,
    mockReset: true,
    projects: [
      {
        test: {
          name: 'unit-tests',
          include: ['src/**/*.test.mts'],
          environment: 'node',
          sequence: {
            concurrent: true,
          }
        },
      },
    ],
  },
});
