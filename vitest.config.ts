import { defineConfig } from 'vitest/config';
import { e2eEnvironment } from './vitest.e2e.environment.js';

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
          globalSetup: ['./vitest.databases.global-setup.ts'],
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
          globalSetup: ['./vitest.databases.global-setup.ts'],
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
        test: {
          name: 'e2e-tests',
          include: ['dist/test/transports/*/e2e/**/*.e2e-test.js'],
          globalSetup: ['./vitest.e2e.global-setup.ts'],
          setupFiles: ['./vitest.setup.ts'],
          env: {
            TEST_PROJECT: 'e2e-tests',
            ...e2eEnvironment,
          },
          mockReset: true,
          fileParallelism: false,
        },
      },
    ],
  },
});
