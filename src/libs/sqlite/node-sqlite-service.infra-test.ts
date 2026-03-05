import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { NodeSqliteService } from './node-sqlite-service.js';
import { diContainer } from '../dependency-injection/index.js';
import type { SqliteQueryResult, UnknownRecord } from './sqlite-service.js';

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

  it('should apply migrations from folder', async (): Promise<void> => {
    await service.migrate();

    const result: SqliteQueryResult<{ name: string }> = await service.query(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name = 'taxonomies';
    `);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.name).toBe('taxonomies');
  });

  it('should truncate all tables except migrations', async (): Promise<void> => {
    await service.migrate();
    await service.query(
      `
        INSERT INTO taxonomies (id, name)
        VALUES (?, ?);
      `,
      ['test-taxonomy-id', 'taxonomy'],
    );

    const before: SqliteQueryResult<{ count: number }> = await service.query(`
      SELECT count(*) AS count
      FROM taxonomies;
    `);
    expect(before.rows[0]?.count).toBe(1);

    await service.truncateAll();

    const afterTruncate: SqliteQueryResult<{ count: number }> = await service.query(`
      SELECT count(*) AS count
      FROM taxonomies;
    `);
    const migrationsCount: SqliteQueryResult<{ count: number }> = await service.query(`
      SELECT count(*) AS count
      FROM migrations;
    `);

    expect(afterTruncate.rows[0]?.count).toBe(0);
    expect(migrationsCount.rows[0]?.count ?? 0).toBeGreaterThan(0);
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

  it('should get row by id', async (): Promise<void> => {
    await service.migrate();
    await service.truncateAll();
    await service.query(
      `
        INSERT INTO taxonomies (id, name)
        VALUES (?, ?);
      `,
      ['taxonomy-id', 'taxonomy'],
    );

    const savedTaxonomy: UnknownRecord | null = await service.getById<UnknownRecord>('taxonomies', 'taxonomy-id');
    expect(savedTaxonomy).toMatchObject({
      id: 'taxonomy-id',
      name: 'taxonomy',
      created_at: expect.any(String),
      parent_id: null,
    });

    const missingTaxonomy: UnknownRecord | null = await service.getById<UnknownRecord>('taxonomies', 'missing-id');
    expect(missingTaxonomy).toBeNull();
  });
});
