import { DatabaseSync, type SQLOutputValue } from 'node:sqlite';
import type { SqliteQueryResult, SqliteService } from './sqlite-service.js';
import type { LoggerService } from '../logger/index.js';
import { getEnvVarOrThrow } from '../kernel/index.js';

export class NodeSqliteService implements SqliteService {
  private readonly loggerService: LoggerService;
  private readonly database: DatabaseSync;

  constructor(loggerService: LoggerService) {
    this.loggerService = loggerService;
    this.database = new DatabaseSync(getEnvVarOrThrow('SQLITE_URL'));
  }

  isReady(): Promise<boolean> {
    try {
      const result: Record<string, SQLOutputValue>[] = this.database.prepare('SELECT 1 AS ok').all();
      return Promise.resolve(result.length === 1 && result[0]?.['ok'] === 1);
    } catch {
      return Promise.resolve(false);
    }
  }

  query<T extends Record<string, unknown>>(
    sql: string,
    values: (number | string)[] = [],
  ): Promise<SqliteQueryResult<T>> {
    const start: number = Date.now();
    const result: Record<string, SQLOutputValue>[] = this.database.prepare(sql).all(...values);
    const duration: number = Date.now() - start;
    this.loggerService.info('SQLite query', { sql, values, duration, rowCount: result.length });
    return Promise.resolve({ rows: result as T[] });
  }

  closeConnection(): Promise<void> {
    this.database.close();
    return Promise.resolve();
  }
}
