import { defineConfig } from 'vitest/config';
import { NovadiUnplugin } from '@novadi/core/unplugin';

export default defineConfig({
  test: {
    watch: false,
    passWithNoTests: true,
    mockReset: true,
    projects: [
      {
        test: {
          name: 'unit-tests',
          include: ['src/**/*.test.ts'],
          setupFiles: ['./vitest.setup.ts'],
          env: {
            NODE_ENV: 'test',
          },
          mockReset: true,
          fileParallelism: true,
        },
      },
      {
        test: {
          name: 'infra-tests',
          include: ['dist/test/modules/*/infrastructure/**/*.infra-test.js'],
          globalSetup: ['./vitest.global-setup.ts'],
          setupFiles: ['./vitest.setup.ts'],
          env: {
            TEST_PROJECT: 'infra-tests',
            NODE_ENV: 'test',
            LOG_LEVEL: 'warn',
            POSTGRES_URL: 'postgres://postgres:postgres@localhost:5556/postgres',
          },
          mockReset: true,
          fileParallelism: false,
        },
      },
      {
        test: {
          name: 'use-case-tests',
          include: ['dist/test/modules/*/interactors/{commands,queries,reactions}/*/*.uc-test.js'],
          globalSetup: ['./vitest.global-setup.ts'],
          setupFiles: ['./vitest.setup.ts'],
          env: {
            TEST_PROJECT: 'use-case-tests',
            NODE_ENV: 'test',
            LOG_LEVEL: 'warn',
            POSTGRES_URL: 'postgres://postgres:postgres@localhost:5556/postgres',
          },
          mockReset: true,
          fileParallelism: false,
        },
      },
      {
        plugins: [NovadiUnplugin.vite({ enableAutowiring: true })],
        test: {
          name: 'e2e-tests',
          env: {
            TEST_PROJECT: 'e2e-tests',
            NODE_OPTIONS: '--disable-warning=ExperimentalWarning',
            E2E_BASE_URL: process.env['E2E_BASE_URL'] ?? `http://localhost:4000`,
          },
          include: ['src/transports/*/e2e/**/*.e2e-test.ts'],
          environment: 'node',
          setupFiles: ['./vitest.setup.ts'],
          sequence: {
            concurrent: false,
          },
        },
      },
    ],
  },
});
