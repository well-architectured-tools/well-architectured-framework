/* eslint-disable no-process-env */
import { config } from 'dotenv-safe';
import type { EnvironmentService, EnvironmentVariables } from './environment-service.mjs';

export class DotenvSafeEnvironmentService implements EnvironmentService {
  private readonly env: EnvironmentVariables;

  constructor() {
    config();

    this.env = {
      LOG_LEVEL: this.getLogLevel(),
      POSTGRES_URL: this.getPostgresUrl(),
    };
  }

  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.env[key];
  }

  private getLogLevel(): EnvironmentVariables['LOG_LEVEL'] {
    const logLevel: string | undefined = process.env['LOG_LEVEL'];
    const allowedLogLevels: EnvironmentVariables['LOG_LEVEL'][] = ['info', 'warn', 'error'];
    if (logLevel === undefined || !allowedLogLevels.includes(logLevel as EnvironmentVariables['LOG_LEVEL'])) {
      throw new Error('Invalid Environment Variable: LOG_LEVEL');
    }
    return logLevel as EnvironmentVariables['LOG_LEVEL'];
  }

  private getPostgresUrl(): EnvironmentVariables['POSTGRES_URL'] {
    const postgresUrl: string | undefined = process.env['POSTGRES_URL'];
    if (postgresUrl === undefined) {
      throw new Error('Invalid Environment Variable: POSTGRES_URL');
    }
    return postgresUrl;
  }
}
