/* eslint-disable no-process-env */
import { config } from 'dotenv-safe';
import type { Environment, EnvironmentVariables } from './environment.mjs';

export class EnvironmentService implements Environment {
  private readonly env: EnvironmentVariables;

  constructor() {
    config();

    this.env = {
      POSTGRES_URL: process.env['POSTGRES_URL'] as string,
    };
  }

  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.env[key];
  }
}
