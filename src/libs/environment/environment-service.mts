/* eslint-disable no-process-env */
import { config } from 'dotenv-safe';
import type { Environment, EnvironmentVariables } from './environment.mjs';

export class EnvironmentService implements Environment {
  private static instance: EnvironmentService | null = null;

  private readonly env: EnvironmentVariables;

  private constructor() {
    config();

    this.env = {
      POSTGRES_URL: process.env['POSTGRES_URL'] as string,
    };
  }

  static getInstance(): EnvironmentService {
    this.instance ??= new EnvironmentService();
    return this.instance;
  }

  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.env[key];
  }
}
