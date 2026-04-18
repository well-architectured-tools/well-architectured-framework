import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { CreateProjectHandler } from './create-project.handler.js';
import { diContainer } from '../../../../../libs/dependency-injection/index.js';
import type { CreateProjectParams } from './create-project.params.js';
import type { CreateProjectDto } from './create-project.dto.js';
import type { PostgresQueryResult, PostgresService } from '../../../../../libs/postgres/index.js';

describe('CreateProjectHandler', (): void => {
  const handler: CreateProjectHandler = diContainer.resolveType('CreateProjectHandler');
  const postgres: PostgresService = diContainer.resolveType('PostgresService');

  afterAll(async (): Promise<void> => {
    await postgres.closeConnection();
  });

  beforeEach(async (): Promise<void> => {
    await postgres.query(`
      TRUNCATE main.project RESTART IDENTITY CASCADE;
    `);
  });

  it('should successfully create project', async (): Promise<void> => {
    const params: CreateProjectParams = {
      name: 'Test Project',
    };

    const result: CreateProjectDto = await handler.execute(params);

    expect(result).toStrictEqual({
      id: expect.any(String),
      name: params.name,
    });
    expect(result.id).toBeUuidV7String();

    const queryResult: PostgresQueryResult<{ id: string; name: string; created_at: Date }> = await postgres.query(
      `
        SELECT id, name, created_at
        FROM main.project
        WHERE id = $1;
      `,
      [result.id],
    );
    expect(queryResult.rows).toHaveLength(1);
    expect(queryResult.rows[0]).toStrictEqual({
      id: expect.any(String),
      name: params.name,
      created_at: expect.any(Date),
    });
    expect(queryResult.rows[0]?.id).toBeUuidV7String();
    // expect(queryResult.rows[0]?.created_at instanceof Date).toBe(true);
  });
});
