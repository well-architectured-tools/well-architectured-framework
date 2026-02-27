import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { NodeSqliteService } from './node-sqlite-service.js';
import { diContainer } from '../dependency-injection/index.js';
import type { SqliteQueryResult } from './sqlite-service.js';

describe('NodeSqliteService', (): void => {
  let service: NodeSqliteService;

  beforeAll((): void => {
    service = diContainer.resolveType('SqliteService');
  });

  afterAll(async (): Promise<void> => {
    await service.closeConnection();
  });

  it('should be ready', async (): Promise<void> => {
    const isReady: boolean = await service.isReady();
    expect(isReady).toBe(true);
  });

  it('should success query', async (): Promise<void> => {
    await service.query(`
      CREATE TABLE IF NOT EXISTS test_items (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    await service.query('DELETE FROM test_items;');
    await service.query('INSERT INTO test_items (name) VALUES (?);', ['item']);

    const result: SqliteQueryResult<{ id: number; name: string }> = await service.query(`
      SELECT id, name
      FROM test_items
      ORDER BY id ASC;
    `);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.name).toBe('item');
  });
});
