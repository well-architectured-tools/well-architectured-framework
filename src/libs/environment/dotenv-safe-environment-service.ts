/* eslint-disable no-process-env */
import { config } from 'dotenv-safe';
import type { EnvironmentService, EnvironmentVariables } from './environment-service.js';

export class DotenvSafeEnvironmentService implements EnvironmentService {
  private readonly env: EnvironmentVariables;

  constructor() {
    if (process.env['DOTENV_SAFE_LOADED'] !== 'true') {
      config();
    }

    this.env = {
      LOG_LEVEL: this.getLogLevel(),
      PORT: this.getPort(),
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

  private getPort(): EnvironmentVariables['PORT'] {
    const port: number = Number.parseInt(process.env['PORT'] ?? '', 10);
    if (Number.isNaN(port) || port < 1 || port > 65_535) {
      throw new Error('Invalid Environment Variable: PORT');
    }
    return port;
  }

  private getPostgresUrl(): EnvironmentVariables['POSTGRES_URL'] {
    const postgresUrl: string | undefined = process.env['POSTGRES_URL'];
    if (postgresUrl === undefined) {
      throw new Error('Invalid Environment Variable: POSTGRES_URL');
    }
    return postgresUrl;
  }
}
