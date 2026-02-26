import { defineConfig } from 'vitest/config';
import { NovadiUnplugin } from '@novadi/core/unplugin';
import type { EnvironmentVariables } from './src/libs/environment/index.js';

const testEnvValues: Record<keyof EnvironmentVariables, string> = {
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
