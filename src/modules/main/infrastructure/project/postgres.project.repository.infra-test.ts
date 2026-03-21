import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PostgresProjectRepository } from './postgres.project.repository.js';
import { diContainer } from '../../../../libs/dependency-injection/index.js';
import type { PostgresService } from '../../../../libs/postgres/index.js';
import { UuidV7 } from '../../../../libs/ddd/index.js';
import type { Project } from '../../domain/aggregates/project.aggregate.js';

describe('PostgresProjectRepository', (): void => {
  let service: PostgresProjectRepository;
  let postgresService: PostgresService;

  beforeAll((): void => {
    service = diContainer.resolveType('PostgresProjectRepository');
    postgresService = diContainer.resolveType('PostgresService');
  });

  afterAll(async (): Promise<void> => {
    await postgresService.closeConnection();
  });

  beforeEach(async (): Promise<void> => {
    await postgresService.query(`
      TRUNCATE waf.project RESTART IDENTITY CASCADE;
    `);
  });

  describe('getById', (): void => {
    it('should return a project when given a valid id', async (): Promise<void> => {
      await postgresService.query(`
        INSERT INTO waf.project (id, name, created_at)
        VALUES
            ('019d1165-f314-736f-8f26-364f5f05e5d7', 'First', '2026-01-21T17:17:15.730Z'),
            ('019d1165-f314-7ab3-ac6c-f576c2bd4bdc', 'Second', '2026-02-21T17:17:26.345Z'),
            ('019d1165-f314-7f93-a573-7700480aa1ea', 'Third', '2026-03-21T17:17:36.477Z');
      `);

      const result: Project | null = await service.getById(
        UuidV7.create({ value: '019d1165-f314-7ab3-ac6c-f576c2bd4bdc' }),
      );

      expect(result).not.toBeNull();
      expect(result?.id.value).toBe('019d1165-f314-7ab3-ac6c-f576c2bd4bdc');
      expect(result?.name).toBe('Second');
      expect(result?.createdAt.iso).toBe('2026-02-21T17:17:26.345Z');
    });
  });
});
