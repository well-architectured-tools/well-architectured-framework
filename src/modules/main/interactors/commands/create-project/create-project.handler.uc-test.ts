import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { diContainer } from '../../../../../libs/dependency-injection/index.js';
import type { SqliteService, UnknownRecord } from '../../../../../libs/sqlite/index.js';
import { CreateProjectHandler } from './create-project.handler.js';
import type { CreateProjectParams } from './create-project.params.js';
import type { CreateProjectDto } from './create-project.dto.js';

describe('CreateProjectHandler', (): void => {
  let handler: CreateProjectHandler;
  let sqliteService: SqliteService;

  beforeAll(async (): Promise<void> => {
    handler = diContainer.resolveType('CreateProjectHandler');
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
    const params: CreateProjectParams = {
      name: 'test',
    };

    const result: CreateProjectDto = await handler.execute(params);
    expect(result.id).toBeUuidV7String();
    expect(result).toStrictEqual({
      id: expect.any(String),
      name: params.name,
    });

    const savedItem: UnknownRecord | null = await sqliteService.getById<UnknownRecord>('project', result.id);
    if (savedItem === null) {
      throw new Error('Expected savedItem to be saved in SQLite');
    }
    expect(savedItem['created_at']).toBeISODateTimeString();
    expect({ ...savedItem }).toStrictEqual({
      id: result.id,
      name: result.name,
      created_at: expect.any(String),
    });
  });
});
