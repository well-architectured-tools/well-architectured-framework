import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateTaxonomyHandler } from './create-taxonomy.handler.js';
import { diContainer } from '../../../../../libs/dependency-injection/index.js';
import type { SqliteService, UnknownRecord } from '../../../../../libs/sqlite/index.js';
import type { CreateTaxonomyParams } from './create-taxonomy.params.js';
import type { CreateTaxonomyDto } from './create-taxonomy.dto.js';

describe('CreateTaxonomyHandler', (): void => {
  let handler: CreateTaxonomyHandler;
  let sqliteService: SqliteService;

  beforeAll(async (): Promise<void> => {
    handler = diContainer.resolveType('CreateTaxonomyHandler');
    sqliteService = diContainer.resolveType('SqliteService');
    await sqliteService.migrate();
  });

  beforeEach(async (): Promise<void> => {
    await sqliteService.truncateAll();
  });

  afterAll(async (): Promise<void> => {
    await sqliteService.closeConnection();
  });

  it('should success', async (): Promise<void> => {
    const params: CreateTaxonomyParams = {
      name: 'test',
    };

    const result: CreateTaxonomyDto = await handler.execute(params);
    expect(result.id).toBeUuidV7String();
    expect(result).toStrictEqual({
      id: expect.any(String),
      name: params.name,
    });

    const savedTaxonomy: UnknownRecord | null = await sqliteService.getById<UnknownRecord>('taxonomies', result.id);
    if (savedTaxonomy === null) {
      throw new Error('Expected taxonomy to be saved in SQLite');
    }
    expect(savedTaxonomy['created_at']).toBeISODateTimeString();
    expect({ ...savedTaxonomy }).toStrictEqual({
      id: result.id,
      name: result.name,
      created_at: expect.any(String),
      parent_id: null,
    });
  });
});
