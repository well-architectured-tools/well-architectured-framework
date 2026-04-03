import type { ProjectRepository } from '../../interactors/shared/project/project.repository.js';
import type { PostgresQueryResult, PostgresService } from '../../../../libs/postgres/index.js';
import { UuidV7 } from '../../../../libs/ddd/index.js';
import type { TransactionalContext } from '../../../../libs/kernel/index.js';
import type { Project } from '../../domain/aggregates/project.aggregate.js';
import { PostgresProjectPersistenceMapper } from './postgres.project.persistence-mapper.js';
import type { PostgresProjectPersistence } from './postgres.project.persistence.js';
import typia from 'typia';
import { handleDataError } from '../../../../libs/errors/index.js';

export class PostgresProjectRepository implements ProjectRepository {
  private readonly postgresService: PostgresService;

  constructor(postgresService: PostgresService) {
    this.postgresService = postgresService;
  }

  async getById(id: UuidV7, transactionalContext?: TransactionalContext): Promise<Project | null> {
    try {
      const queryResult: PostgresQueryResult<PostgresProjectPersistence> = await this.postgresService.query(
        `
        SELECT id, name, created_at
        FROM waf.project
        WHERE id = $1;
      `,
        [id.value],
        transactionalContext,
      );

      const data: PostgresProjectPersistence | undefined = queryResult.rows[0];

      if (data === undefined) {
        return null;
      }

      typia.assert<PostgresProjectPersistence>(data);

      return PostgresProjectPersistenceMapper.toDomain(data);
    } catch (error) {
      handleDataError(error);
    }
  }

  async save(project: Project, transactionalContext?: TransactionalContext): Promise<void> {
    try {
      await this.postgresService.query(
        `
          INSERT INTO waf.project (id, name, created_at)
          VALUES ($1, $2, $3);
        `,
        [project.id.value, project.name, project.createdAt.iso],
        transactionalContext,
      );
    } catch (error) {
      handleDataError(error);
    }
  }

  async delete(id: UuidV7, transactionalContext?: TransactionalContext): Promise<void> {
    try {
      await this.postgresService.query(
        `
          DELETE FROM waf.project
          WHERE id = $1;
        `,
        [id.value],
        transactionalContext,
      );
    } catch (error) {
      handleDataError(error);
    }
  }
}
