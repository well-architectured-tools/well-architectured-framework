import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PostgresProjectRepository } from './postgres.project.repository.js';
import { diContainer } from '../../../../libs/dependency-injection/index.js';
import type { PostgresService } from '../../../../libs/postgres/index.js';
import type { Project } from '../../domain/aggregates/project.aggregate.js';
import { ApplicationError } from '../../../../libs/errors/index.js';
import type { ProjectData } from '../../interactors/shared/project/project.data.js';
import { UuidV7 } from '../../../../libs/ddd/index.js';

describe('PostgresProjectRepository', (): void => {
  let service: PostgresProjectRepository;
  let postgresService: PostgresService;

  const project1: ProjectData = {
    id: '019d1165-f314-736f-8f26-364f5f05e5d7',
    name: 'First',
    created_at: new Date('2026-01-21T17:17:15.730Z'),
  };
  const project2: ProjectData = {
    id: '019d1165-f314-7ab3-ac6c-f576c2bd4bdc',
    name: 'Second',
    created_at: new Date('2026-02-21T17:17:26.345Z'),
  };
  const project3: ProjectData = {
    id: '019d1165-f314-7dc9-a78d-d15406ddaf9e',
    name: 'Third',
    created_at: new Date('2026-03-21T17:17:36.477Z'),
  };

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
      vi.spyOn(postgresService, 'query').mockResolvedValueOnce({
        rows: [
          {
            id: project2.id,
            // @ts-expect-error intentionally invalid type: name must be string — this should never happen at runtime
            name: 777,
            created_at: project2.created_at,
          } satisfies ProjectData,
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

  // describe('save', (): void => {
  //   it('should persist a project', async (): Promise<void> => {
  //     const project: Project = createProject(projectId1, 'New project', '2026-01-21T17:17:15.730Z');
  //
  //     await service.save(project);
  //
  //     const row: ProjectData | null = await getRowById(postgresService, project.id);
  //
  //     expect(row).not.toBeNull();
  //     expect(row).toMatchObject({
  //       id: project.id.value,
  //       name: project.name,
  //     });
  //     expect(row?.created_at.toISOString()).toBe(project.createdAt.iso);
  //   });
  //
  //   it('should rollback saved project when transaction fails', async (): Promise<void> => {
  //     const rollbackError: Error = new Error('rollback save transaction');
  //     const project: Project = createProject(projectId2, 'Project in transaction', '2026-02-21T17:17:26.345Z');
  //
  //     await expect(
  //       postgresService.withTransaction(async (transactionalContext: TransactionalContext): Promise<void> => {
  //         await service.save(project, transactionalContext);
  //
  //         const row: ProjectData | null = await getRowById(postgresService, project.id, transactionalContext);
  //
  //         expect(row).not.toBeNull();
  //         expect(row?.id).toBe(project.id.value);
  //
  //         throw rollbackError;
  //       }),
  //     ).rejects.toBe(rollbackError);
  //
  //     expect(await getRowById(postgresService, project.id)).toBeNull();
  //   });
  //
  //   it('should throw DATA_ERROR when project cannot be persisted', async (): Promise<void> => {
  //     const project: Project = createProject(projectId3, 'Duplicated project', '2026-03-21T17:17:36.477Z');
  //
  //     await service.save(project);
  //
  //     const error: unknown = await service.save(project).catch((caughtError: unknown): unknown => caughtError);
  //
  //     expect(error).toBeInstanceOf(ApplicationError);
  //     expect(error).toMatchObject({
  //       type: 'UNEXPECTED',
  //       code: 'DATA_ERROR',
  //     });
  //     expect(error).toBeInstanceOf(Error);
  //     expect((error as Error).message).toContain('duplicate key value violates unique constraint');
  //   });
  // });
  //
  // describe('delete', (): void => {
  //   it('should delete a persisted project', async (): Promise<void> => {
  //     await postgresService.query(
  //       `
  //         INSERT INTO waf.project (id, name, created_at)
  //         VALUES ($1, $2, $3);
  //       `,
  //       [projectId1.value, 'Project to delete', '2026-01-21T17:17:15.730Z'],
  //     );
  //
  //     await service.delete(projectId1);
  //
  //     expect(await getRowById(postgresService, projectId1)).toBeNull();
  //   });
  //
  //   it('should rollback deleted project when transaction fails', async (): Promise<void> => {
  //     const rollbackError: Error = new Error('rollback delete transaction');
  //
  //     await postgresService.query(
  //       `
  //         INSERT INTO waf.project (id, name, created_at)
  //         VALUES ($1, $2, $3);
  //       `,
  //       [projectId2.value, 'Project to delete in transaction', '2026-02-21T17:17:26.345Z'],
  //     );
  //
  //     await expect(
  //       postgresService.withTransaction(async (transactionalContext: TransactionalContext): Promise<void> => {
  //         await service.delete(projectId2, transactionalContext);
  //
  //         const result: Project | null = await service.getById(projectId2, transactionalContext);
  //
  //         expect(result).toBeNull();
  //
  //         throw rollbackError;
  //       }),
  //     ).rejects.toBe(rollbackError);
  //
  //     const row: ProjectData | null = await getRowById(postgresService, projectId2);
  //
  //     expect(row).not.toBeNull();
  //     expect(row?.id).toBe(projectId2.value);
  //   });
  //
  //   it('should throw DATA_ERROR when transactional context provider is invalid', async (): Promise<void> => {
  //     const error: unknown = await service
  //       .delete(projectId3, invalidTransactionalContext)
  //       .catch((caughtError: unknown): unknown => caughtError);
  //
  //     expect(error).toBeInstanceOf(ApplicationError);
  //     expect(error).toMatchObject({
  //       type: 'UNEXPECTED',
  //       code: 'DATA_ERROR',
  //       message: 'Expected postgres transactional context but received sqlite',
  //     });
  //   });
  // });
});
