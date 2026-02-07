import { Pool, type QueryResult } from 'pg';
import type { PostgresQueryResult, PostgresService } from './postgres-service.mjs';
import type { EnvironmentService } from '../environment/index.mjs';
import type { LoggerService } from '../logger/index.mjs';

export class PgPostgresService implements PostgresService {
  private readonly loggerService: LoggerService;
  private readonly pool: Pool;

  constructor(environmentService: EnvironmentService, loggerService: LoggerService) {
    this.loggerService = loggerService;

    this.pool = new Pool({
      connectionString: environmentService.get('POSTGRES_URL'),
      max: 10, // CPU * 2
      min: 0,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5000,
      allowExitOnIdle: false,
      keepAlive: true,
      maxUses: 7500,

      maxLifetimeSeconds: 60,
    });

    this.pool.on('error', (error: Error): void => {
      this.loggerService.error('Unexpected Postgres pool error', { error });
    });
  }

  async query<T extends Record<string, unknown>>(sql: string, values: unknown[] = []): Promise<PostgresQueryResult<T>> {
    const start: number = Date.now();
    const result: QueryResult<T> = await this.pool.query<T>(sql, values);
    const duration: number = Date.now() - start;
    this.loggerService.info('Postgres query', { sql, values, duration, rows: result.rowCount });
    return { rows: result.rows };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async checkHealth(): Promise<void> {
    await this.pool.query('SELECT 1 AS ok;');
  }
}
