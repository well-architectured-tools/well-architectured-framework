import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PgPostgresService } from './pg-postgres-service.js';
import { diContainer } from '../dependency-injection/index.js';
import type { PostgresQueryResult } from './postgres-service.js';

describe('PgPostgresService', (): void => {
  let service: PgPostgresService;

  beforeAll((): void => {
    service = diContainer.resolveType('PostgresService');
  });

  afterAll(async (): Promise<void> => {
    await service.closeConnection();
  });

  it('should be ready', async (): Promise<void> => {
    const isReady: boolean = await service.isReady();
    expect(isReady).toBe(true);
  });

  it('should success query', async (): Promise<void> => {
    const result: PostgresQueryResult<unknown> = await service.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public';
    `);
    expect(result.rows).toBeDefined();
  });
});
