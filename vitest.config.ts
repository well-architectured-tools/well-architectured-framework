import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { NovadiUnplugin } from '@novadi/core/unplugin';
import type { EnvironmentVariables } from './src/libs/environment/index.js';

const testEnvValues: { NODE_OPTIONS: string } & Record<keyof EnvironmentVariables, string> = {
  NODE_OPTIONS: '--disable-warning=ExperimentalWarning',
  LOAD_DOTENV: 'false',
  NODE_ENV: 'test',
  LOG_LEVEL: 'warn',
  PORT: '3000',
  POSTGRES_URL: 'postgres://postgres:postgres@localhost:5555/postgres',
};

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
          environment: 'node',
          setupFiles: ['./vitest.setup.ts'],
          sequence: {
            concurrent: true,
          },
        },
      },
      {
        plugins: [NovadiUnplugin.vite({ enableAutowiring: true })],
        test: {
          name: 'use-case-tests',
          env: {
            TEST_PROJECT: 'use-case-tests',
            SQLITE_URL: ':memory:',
            SQLITE_MIGRATIONS_PATH: path.resolve(process.cwd(), 'migrations/sqlite'),
            ...testEnvValues,
          },
          include: ['src/modules/*/interactors/{commands,queries}/*/*.uc-test.ts'],
          environment: 'node',
          setupFiles: ['./vitest.setup.ts'],
          sequence: {
            concurrent: true,
          },
        },
      },
      {
        plugins: [NovadiUnplugin.vite({ enableAutowiring: true })],
        test: {
          name: 'infra-tests',
          env: {
            TEST_PROJECT: 'infra-tests',
            SQLITE_URL: ':memory:',
            SQLITE_MIGRATIONS_PATH: path.resolve(process.cwd(), 'migrations/sqlite'),
            ...testEnvValues,
          },
          include: ['src/libs/**/*.infra-test.ts', 'src/modules/*/infrastructure/**/*.infra-test.ts'],
          environment: 'node',
          setupFiles: ['./vitest.setup.ts'],
          sequence: {
            concurrent: false,
          },
        },
      },
      {
        plugins: [NovadiUnplugin.vite({ enableAutowiring: true })],
        test: {
          name: 'e2e-tests',
          env: {
            TEST_PROJECT: 'e2e-tests',
            E2E_BASE_URL: process.env['E2E_BASE_URL'] ?? `http://localhost:${testEnvValues.PORT}`,
            ...testEnvValues,
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
