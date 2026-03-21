import type { ProjectRepository } from '../../interactors/shared/project/project.repository.js';
import type { SqliteQueryResult, SqliteService } from '../../../../libs/sqlite/index.js';
import type { ProjectData } from '../../interactors/shared/project/project.data.js';
import typia from 'typia';
import { ProjectMapper } from '../../interactors/shared/project/project.mapper.js';
import { handleDataError } from '../../../../libs/errors/index.js';
import { UuidV7 } from '../../../../libs/ddd/index.js';
import type { TransactionalContext } from '../../../../libs/kernel/index.js';
import type { Project } from '../../domain/aggregates/project.aggregate.js';

export class SqliteProjectRepository implements ProjectRepository {
  private readonly sqliteService: SqliteService;

  constructor(sqliteService: SqliteService) {
    this.sqliteService = sqliteService;
  }

  async getById(id: UuidV7, transactionalContext?: TransactionalContext): Promise<Project | null> {
    try {
      const queryResult: SqliteQueryResult<ProjectData> = await this.sqliteService.query(
        `
          SELECT id, name, created_at
          FROM project
          WHERE id = ?;
        `,
        [id.value],
        transactionalContext,
      );

      const data: ProjectData | undefined = queryResult.rows[0];

      if (data === undefined) {
        return null;
      }

      typia.assert<ProjectData>(data);

      return ProjectMapper.toDomain(data);
    } catch (error) {
      handleDataError(error);
    }
  }

  async save(project: Project, transactionalContext?: TransactionalContext): Promise<void> {
    try {
      await this.sqliteService.query(
        `
          INSERT INTO project (id, name, created_at)
          VALUES (?, ?, ?);
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
      await this.sqliteService.query(
        `
          DELETE FROM project
          WHERE id = ?;
        `,
        [id.value],
        transactionalContext,
      );
    } catch (error) {
      handleDataError(error);
    }
  }
}
