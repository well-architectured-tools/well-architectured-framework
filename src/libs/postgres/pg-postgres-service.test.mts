import { beforeAll, describe, expect, it } from 'vitest';
import { PgPostgresService } from './pg-postgres-service.mjs';
import { diContainer } from '../dependency-injection/index.mjs';

describe('PgPostgresService', (): void => {
  let service: PgPostgresService;

  beforeAll((): void => {
    service = diContainer.resolveType('PostgresService');
  });

  it('should return value', async (): Promise<void> => {
    await service.checkHealth();
    expect(true).toBeDefined();
  });
});
