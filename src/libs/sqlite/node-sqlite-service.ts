import path from 'node:path';
import { DatabaseSync, type SQLInputValue, type SQLOutputValue } from 'node:sqlite';
import { readdir, readFile } from 'node:fs/promises';
import type { TransactionalContext } from '../kernel/index.js';
import { getEnvVarOrThrow } from '../kernel/index.js';
import type { SqliteQueryResult, SqliteService, UnknownRecord } from './sqlite-service.js';
import type { LoggerService } from '../logger/index.js';

export interface NodeSqliteTransactionalContext extends TransactionalContext<DatabaseSync> {
  readonly provider: 'sqlite';
}

export class NodeSqliteService implements SqliteService {
  private readonly loggerService: LoggerService;
  private readonly database: DatabaseSync;
  private readonly migrationsPath: string;

  constructor(loggerService: LoggerService) {
    this.loggerService = loggerService;
    this.database = new DatabaseSync(getEnvVarOrThrow('SQLITE_URL'));
    this.migrationsPath = getEnvVarOrThrow('SQLITE_MIGRATIONS_PATH');
  }

  isReady(): Promise<boolean> {
    try {
      const result: Record<string, SQLOutputValue>[] = this.database.prepare('SELECT 1 AS ok').all();
      return Promise.resolve(result.length === 1 && result[0]?.['ok'] === 1);
    } catch {
      return Promise.resolve(false);
    }
  }

  async migrate(): Promise<void> {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS migrations
      (
        id TEXT PRIMARY KEY,
        executed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
    `);

    const rows: Record<string, SQLOutputValue>[] = this.database
      .prepare(
        `
      SELECT id
      FROM migrations
      ORDER BY id ASC;
    `,
      )
      .all();
    const appliedMigrationIds: Set<string> = new Set<string>(
      rows
        .map((row: Record<string, SQLOutputValue>): SQLOutputValue | undefined => row['id'])
        .filter((id: SQLOutputValue | undefined): id is string => {
          return typeof id === 'string';
        }),
    );
    const migrationFileNames: string[] = await this.getSqlFileNames(this.migrationsPath);

    for (const migrationFileName of migrationFileNames) {
      if (appliedMigrationIds.has(migrationFileName)) {
        continue;
      }

      const migrationPath: string = path.resolve(this.migrationsPath, migrationFileName);
      const migrationSql: string = await readFile(migrationPath, 'utf8');
      const start: number = Date.now();

      this.database.exec('BEGIN');
      try {
        this.database.exec(migrationSql);
        this.database.prepare('INSERT INTO migrations (id) VALUES (?);').run(migrationFileName);
        this.database.exec('COMMIT');
      } catch (error) {
        this.database.exec('ROLLBACK');
        throw error;
      }

      const duration: number = Date.now() - start;
      this.loggerService.info('SQLite migration applied', { migrationFileName, duration });
    }
  }

  truncateAll(): Promise<void> {
    const rows: Record<string, SQLOutputValue>[] = this.database
      .prepare(
        `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        AND name <> 'migrations'
      ORDER BY name ASC;
    `,
      )
      .all();
    const tableNames: string[] = rows
      .map((row: Record<string, SQLOutputValue>): SQLOutputValue | undefined => row['name'])
      .filter((tableName: SQLOutputValue | undefined): tableName is string => {
        return typeof tableName === 'string';
      });

    if (tableNames.length === 0) {
      this.loggerService.info('SQLite truncate all', { tableCount: 0 });
      return Promise.resolve();
    }

    this.database.exec('PRAGMA foreign_keys = OFF;');
    this.database.exec('BEGIN');
    try {
      for (const tableName of tableNames) {
        this.database.exec(`DELETE FROM ${this.escapeIdentifier(tableName)};`);
      }
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    } finally {
      this.database.exec('PRAGMA foreign_keys = ON;');
    }

    this.loggerService.info('SQLite truncate all', { tableNames, tableCount: tableNames.length });
    return Promise.resolve();
  }

  query<T extends UnknownRecord>(
    sql: string,
    values: SQLInputValue[] = [],
    transactionalContext?: TransactionalContext,
  ): Promise<SqliteQueryResult<T>> {
    const database: DatabaseSync = this.getDatabase(transactionalContext);
    const result: Record<string, SQLOutputValue>[] = database.prepare(sql).all(...values);
    return Promise.resolve({ rows: result as T[] });
  }

  async withTransaction<TResult>(
    operation: (transactionalContext: NodeSqliteTransactionalContext) => Promise<TResult>,
    existingTransactionalContext?: TransactionalContext,
  ): Promise<TResult> {
    if (existingTransactionalContext !== undefined) {
      const transactionContext: NodeSqliteTransactionalContext =
        this.assertTransactionContext(existingTransactionalContext);
      return await operation(transactionContext);
    }

    const transactionContext: NodeSqliteTransactionalContext = {
      provider: 'sqlite',
      transaction: this.database,
    };

    try {
      this.database.exec('BEGIN');
      const result: TResult = await operation(transactionContext);
      this.database.exec('COMMIT');
      return result;
    } catch (error) {
      try {
        this.database.exec('ROLLBACK');
        this.loggerService.warn('SQLite transaction rolled back');
      } catch (rollbackError) {
        this.loggerService.error('SQLite transaction rollback failed', { error: rollbackError });
      }
      throw error;
    }
  }

  getById<T extends UnknownRecord>(
    tableName: string,
    id: number | string,
    transactionalContext?: TransactionalContext,
  ): Promise<T | null> {
    const escapedTableName: string = this.escapeIdentifier(tableName);
    const sql: string = `
      SELECT *
      FROM ${escapedTableName}
      WHERE id = ?
      LIMIT 1;
    `;
    const database: DatabaseSync = this.getDatabase(transactionalContext);
    const result: Record<string, SQLOutputValue> | undefined = database.prepare(sql).get(id);
    return Promise.resolve((result as T | undefined) ?? null);
  }

  closeConnection(): Promise<void> {
    this.database.close();
    return Promise.resolve();
  }

  private async getSqlFileNames(path: string): Promise<string[]> {
    const directoryEntries: string[] = await readdir(path);
    return directoryEntries
      .filter((entry: string): boolean => {
        return entry.endsWith('.sql');
      })
      .toSorted((left: string, right: string): number => {
        return left.localeCompare(right);
      });
  }

  private escapeIdentifier(identifier: string): string {
    return `"${identifier.replaceAll('"', '""')}"`;
  }

  private getDatabase(transactionalContext?: TransactionalContext): DatabaseSync {
    if (transactionalContext === undefined) {
      return this.database;
    }

    return this.assertTransactionContext(transactionalContext).transaction;
  }

  private assertTransactionContext(transactionalContext: TransactionalContext): NodeSqliteTransactionalContext {
    if (transactionalContext.provider !== 'sqlite') {
      throw new Error(`Expected sqlite transactional context but received ${transactionalContext.provider}`);
    }

    return transactionalContext as NodeSqliteTransactionalContext;
  }
}
