/* eslint-disable no-process-env */
import { config } from 'dotenv-safe';
import type { EnvironmentService, EnvironmentVariables } from './environment-service.mjs';

export class DotenvSafeEnvironmentService implements EnvironmentService {
  private readonly env: EnvironmentVariables;

  constructor() {
    config();

    this.env = {
      DATABASE_URL: process.env['DATABASE_URL'] as string,
    };
  }

  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.env[key];
  }
}
