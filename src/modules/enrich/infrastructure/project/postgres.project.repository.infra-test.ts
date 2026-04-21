import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PostgresProjectRepository } from './postgres.project.repository.js';
import { diContainer } from '../../../../libs/dependency-injection/index.js';
import type { PostgresService } from '../../../../libs/postgres/index.js';
import { Project } from '../../domain/aggregates/project.aggregate.js';
import { ApplicationError } from '../../../../libs/kernel/index.js';
import type { PostgresProjectPersistence } from './postgres.project.persistence.js';
import { DateTime, UuidV7 } from '../../../../libs/ddd/index.js';

describe('PostgresProjectRepository', (): void => {
  const service: PostgresProjectRepository = diContainer.resolveType('PostgresProjectRepository');
  const postgres: PostgresService = diContainer.resolveType('PostgresService');

  const project1: PostgresProjectPersistence = {
    id: '019d1165-f314-736f-8f26-364f5f05e5d7',
    name: 'First',
    created_at: new Date('2026-01-21T17:17:15.730Z'),
  };
  const project2: PostgresProjectPersistence = {
    id: '019d1165-f314-7ab3-ac6c-f576c2bd4bdc',
    name: 'Second',
    created_at: new Date('2026-02-21T17:17:26.345Z'),
  };
  const project3: PostgresProjectPersistence = {
    id: '019d1165-f314-7dc9-a78d-d15406ddaf9e',
    name: 'Third',
    created_at: new Date('2026-03-21T17:17:36.477Z'),
  };

  afterAll(async (): Promise<void> => {
    await postgres.closeConnection();
  });

  beforeEach(async (): Promise<void> => {
    await postgres.query(`
      TRUNCATE enrich.project RESTART IDENTITY CASCADE;
    `);
  });

  describe('getById', (): void => {
    it('should return a project when given a valid id', async (): Promise<void> => {
      await postgres.query(`
        INSERT INTO enrich.project (id, name, created_at)
        VALUES
            ('${project1.id}', '${project1.name}', '${project1.created_at.toISOString()}'),
            ('${project2.id}', '${project2.name}', '${project2.created_at.toISOString()}'),
            ('${project3.id}', '${project3.name}', '${project3.created_at.toISOString()}');
      `);

      const result: Project | null = await service.getById(UuidV7.create({ value: project2.id }));

      expect(result).not.toBeNull();
      expect(result?.id.value).toBe(project2.id);
      expect(result?.name).toBe(project2.name);
      expect(result?.createdAt.iso).toBe(project2.created_at.toISOString());
    });

    it('should return null when project is not found', async (): Promise<void> => {
      const missingProjectId: string = '019d156f-f561-7b1b-bd4b-02d7f0bf81c9';
      const result: Project | null = await service.getById(UuidV7.create({ value: missingProjectId }));

      expect(result).toBeNull();
    });

    it('should throw DATA_VALIDATION_ERROR when database row schema is invalid', async (): Promise<void> => {
      vi.spyOn(postgres, 'query').mockResolvedValueOnce({
        rows: [
          {
            id: project2.id,
            // @ts-expect-error intentionally invalid type: name must be string — this should never happen at runtime
            name: 777,
            created_at: project2.created_at,
          } satisfies PostgresProjectPersistence,
        ],
      });

      const result: Promise<Project | null> = service.getById(UuidV7.create({ value: project2.id }));

      await expect(result).rejects.toBeInstanceOf(ApplicationError);
      await expect(result).rejects.toMatchObject({
        type: 'UNEXPECTED',
        code: 'DATA_VALIDATION_ERROR',
        message: 'Invalid data schema',
      });
    });
  });

  describe('save', (): void => {
    it('should persist a project', async (): Promise<void> => {
      const project: Project = Project.rehydrate(
        {
          name: project1.name,
          createdAt: DateTime.create({ iso: project1.created_at.toISOString() }),
        },
        UuidV7.create({ value: project1.id }),
      );

      await service.save(project);

      const result: Project | null = await service.getById(UuidV7.create({ value: project1.id }));

      expect(result).not.toBeNull();
      expect(result?.id.value).toBe(project.id.value);
      expect(result?.name).toBe(project.name);
      expect(result?.createdAt.iso).toBe(project.createdAt.iso);
    });

    it('should throw DATA_ERROR when project cannot be persisted', async (): Promise<void> => {
      const project: Project = Project.rehydrate(
        {
          name: project1.name,
          createdAt: DateTime.create({ iso: project1.created_at.toISOString() }),
        },
        UuidV7.create({ value: project1.id }),
      );

      await service.save(project);

      const result: Promise<void> = service.save(project);

      await expect(result).rejects.toBeInstanceOf(ApplicationError);
      await expect(result).rejects.toMatchObject({
        type: 'UNEXPECTED',
        code: 'DATA_ERROR',
        message: 'duplicate key value violates unique constraint "project_pkey"',
      });
    });
  });

  describe('delete', (): void => {
    it('should delete a persisted project', async (): Promise<void> => {
      const project: Project = Project.rehydrate(
        {
          name: project1.name,
          createdAt: DateTime.create({ iso: project1.created_at.toISOString() }),
        },
        UuidV7.create({ value: project1.id }),
      );

      await service.save(project);
      await service.delete(project.id);

      const result: Project | null = await service.getById(UuidV7.create({ value: project1.id }));

      expect(result).toBeNull();
    });

    it('should throw DATA_ERROR when transactional context provider is invalid', async (): Promise<void> => {
      const result: Promise<void> = service.delete(UuidV7.create({ value: project3.id }), {
        provider: 'sqlite',
        transaction: {},
      });

      await expect(result).rejects.toBeInstanceOf(ApplicationError);
      await expect(result).rejects.toMatchObject({
        type: 'UNEXPECTED',
        code: 'DATA_ERROR',
        message: 'Expected postgres transactional context but received "sqlite"',
      });
    });
  });
});
