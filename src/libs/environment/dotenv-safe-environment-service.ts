/* eslint-disable no-process-env */
import { config } from 'dotenv-safe';
import type { EnvironmentService, EnvironmentVariables } from './environment-service.js';

export class DotenvSafeEnvironmentService implements EnvironmentService {
  private readonly env: EnvironmentVariables;

  constructor() {
    if (this.getLoadDotenv()) {
      config();
    }

    this.env = {
      LOAD_DOTENV: this.getLoadDotenv(),
      NODE_ENV: this.getNodeEnv(),
      LOG_LEVEL: this.getLogLevel(),
      PORT: this.getPort(),
      POSTGRES_URL: this.getPostgresUrl(),
      SQLITE_URL: this.getSqliteUrl(),
    };
  }

  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.env[key];
  }

  private getLoadDotenv(): EnvironmentVariables['LOAD_DOTENV'] {
    const loadDotenv: string = process.env['LOAD_DOTENV'] ?? 'true';
    if (loadDotenv !== 'true' && loadDotenv !== 'false') {
      throw new Error('Invalid Environment Variable: LOAD_DOTENV');
    }
    return loadDotenv === 'true';
  }

  private getNodeEnv(): EnvironmentVariables['NODE_ENV'] {
    const nodeEnv: string | undefined = process.env['NODE_ENV'];
    const allowedNodeEnvs: EnvironmentVariables['NODE_ENV'][] = ['production', 'development', 'test'];
    if (nodeEnv === undefined || !allowedNodeEnvs.includes(nodeEnv as EnvironmentVariables['NODE_ENV'])) {
      throw new Error('Invalid Environment Variable: NODE_ENV');
    }
    return nodeEnv as EnvironmentVariables['NODE_ENV'];
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

  private getSqliteUrl(): EnvironmentVariables['SQLITE_URL'] {
    const sqliteUrl: string | undefined = process.env['SQLITE_URL'];
    if (sqliteUrl === undefined) {
      throw new Error('Invalid Environment Variable: SQLITE_URL');
    }
    return sqliteUrl;
  }
}
