import path from 'node:path';
import { DatabaseSync, type SQLOutputValue } from 'node:sqlite';
import { readdir, readFile } from 'node:fs/promises';
import type { SqliteQueryResult, SqliteService, UnknownRecord } from './sqlite-service.js';
import type { LoggerService } from '../logger/index.js';
import { getEnvVarOrThrow } from '../kernel/index.js';

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
    const start: number = Date.now();
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
      this.loggerService.info('SQLite truncate all', { duration: Date.now() - start, tableCount: 0 });
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

    const duration: number = Date.now() - start;
    this.loggerService.info('SQLite truncate all', { duration, tableNames, tableCount: tableNames.length });
    return Promise.resolve();
  }

  query<T extends UnknownRecord>(
    sql: string,
    values: (number | string)[] = [],
  ): Promise<SqliteQueryResult<T>> {
    const start: number = Date.now();
    const result: Record<string, SQLOutputValue>[] = this.database.prepare(sql).all(...values);
    const duration: number = Date.now() - start;
    this.loggerService.info('SQLite query', { sql, values, duration, rowCount: result.length });
    return Promise.resolve({ rows: result as T[] });
  }

  getById<T extends UnknownRecord>(tableName: string, id: number | string): Promise<T | null> {
    const escapedTableName: string = this.escapeIdentifier(tableName);
    const sql: string = `
      SELECT *
      FROM ${escapedTableName}
      WHERE id = ?
      LIMIT 1;
    `;
    const start: number = Date.now();
    const result: Record<string, SQLOutputValue> | undefined = this.database.prepare(sql).get(id);
    const duration: number = Date.now() - start;
    this.loggerService.info('SQLite get by id', { tableName, id, duration, found: result !== undefined });
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
}
