import { Pool, type PoolClient, type QueryResult } from 'pg';
import type { TransactionalContext } from '../kernel/index.js';
import type { PostgresQueryResult, PostgresService } from './postgres-service.js';
import type { EnvironmentService } from '../environment/index.js';
import type { LoggerService } from '../logger/index.js';

export interface PgPostgresTransactionalContext extends TransactionalContext<PoolClient> {
  readonly provider: 'postgres';
}

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

  async query<T extends Record<string, unknown>>(
    sql: string,
    values: unknown[] = [],
    transactionalContext?: TransactionalContext,
  ): Promise<PostgresQueryResult<T>> {
    const queryable: Pool | PoolClient = this.getQueryable(transactionalContext);
    const result: QueryResult<T> = await queryable.query<T>(sql, values);
    return { rows: result.rows };
  }

  async withTransaction<TResult>(
    operation: (transactionalContext: PgPostgresTransactionalContext) => Promise<TResult>,
    existingTransactionalContext?: TransactionalContext,
  ): Promise<TResult> {
    if (existingTransactionalContext !== undefined) {
      const transactionContext: PgPostgresTransactionalContext =
        this.assertTransactionContext(existingTransactionalContext);
      return await operation(transactionContext);
    }

    const client: PoolClient = await this.pool.connect();
    const transactionContext: PgPostgresTransactionalContext = {
      provider: 'postgres',
      transaction: client,
    };

    try {
      await client.query('BEGIN');
      const result: TResult = await operation(transactionContext);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
        this.loggerService.warn('Postgres transaction rolled back');
      } catch (rollbackError) {
        this.loggerService.error('Postgres transaction rollback failed', { error: rollbackError });
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async closeConnection(): Promise<void> {
    await this.pool.end();
  }

  private getQueryable(transactionalContext?: TransactionalContext): Pool | PoolClient {
    if (transactionalContext === undefined) {
      return this.pool;
    }

    return this.assertTransactionContext(transactionalContext).transaction;
  }

  private assertTransactionContext(transactionalContext: TransactionalContext): PgPostgresTransactionalContext {
    if (transactionalContext.provider !== 'postgres') {
      throw new Error(`Expected postgres transactional context but received "${transactionalContext.provider}"`);
    }

    return transactionalContext as PgPostgresTransactionalContext;
  }
}
