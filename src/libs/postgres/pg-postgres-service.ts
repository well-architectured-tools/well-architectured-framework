import { Pool, type QueryResult } from 'pg';
import type { PostgresQueryResult, PostgresService } from './postgres-service.js';
import type { EnvironmentService } from '../environment/index.js';
import type { LoggerService } from '../logger/index.js';

export class PgPostgresService implements PostgresService {
  private readonly loggerService: LoggerService;
  private readonly pool: Pool;

  constructor(environmentService: EnvironmentService, loggerService: LoggerService) {
    this.loggerService = loggerService;

    this.pool = new Pool({
      connectionString: environmentService.get('POSTGRES_URL'),
      max: 10,
      min: 1,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5000,
      keepAlive: true,
      allowExitOnIdle: false,
      maxLifetimeSeconds: 60 * 60, // 60 minutes
      maxUses: 10_000,
    });

    this.pool.on('error', (error: Error): void => {
      this.loggerService.error('Unexpected Postgres pool error', { error });
    });
  }

  async isReady(): Promise<boolean> {
    try {
      const result: QueryResult<{ ok: 1 }> = await this.pool.query('SELECT 1 AS ok');
      return result.rowCount === 1 && result.rows[0]?.ok === 1;
    } catch {
      return false;
    }
  }

  async query<T extends Record<string, unknown>>(sql: string, values: unknown[] = []): Promise<PostgresQueryResult<T>> {
    const start: number = Date.now();
    const result: QueryResult<T> = await this.pool.query<T>(sql, values);
    const duration: number = Date.now() - start;
    this.loggerService.info('Postgres query', { sql, values, duration, rowCount: result.rowCount });
    return { rows: result.rows };
  }

  async closeConnection(): Promise<void> {
    await this.pool.end();
  }
}
