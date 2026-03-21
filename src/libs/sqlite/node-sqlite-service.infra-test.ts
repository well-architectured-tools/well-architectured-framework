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
        AND name = 'project';
    `);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.name).toBe('project');
  });

  it('should truncate all tables except migrations', async (): Promise<void> => {
    await service.migrate();
    await service.query(
      `
        INSERT INTO project (id, name, created_at)
        VALUES (?, ?, ?);
      `,
      ['019d1175-f8aa-76a8-af9d-b74da9d08b39', 'some-project', '2026-03-21T19:24:31.434Z'],
    );

    const before: SqliteQueryResult<{ count: number }> = await service.query(`
      SELECT count(*) AS count
      FROM project;
    `);
    expect(before.rows[0]?.count).toBe(1);

    await service.truncateAll();

    const afterTruncate: SqliteQueryResult<{ count: number }> = await service.query(`
      SELECT count(*) AS count
      FROM project;
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
        INSERT INTO project (id, name, created_at)
        VALUES (?, ?, ?);
      `,
      ['019d1175-f8aa-7b05-a2f4-3752e60a5b28', 'another-project', '2026-03-21T19:24:31.434Z'],
    );

    const savedProject: UnknownRecord | null = await service.getById<UnknownRecord>(
      'project',
      '019d1175-f8aa-7b05-a2f4-3752e60a5b28',
    );
    expect(savedProject).toMatchObject({
      id: '019d1175-f8aa-7b05-a2f4-3752e60a5b28',
      name: 'another-project',
      created_at: expect.any(String),
    });

    const missingProject: UnknownRecord | null = await service.getById<UnknownRecord>(
      'project',
      '019d1175-f8aa-7018-8aea-c45cf81769ff',
    );
    expect(missingProject).toBeNull();
  });
});
