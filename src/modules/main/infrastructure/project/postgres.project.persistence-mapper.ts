import type { PersistenceMapper } from '../../../../libs/kernel/index.js';
import { DateTime, UuidV7 } from '../../../../libs/ddd/index.js';
import { Project } from '../../domain/aggregates/project.aggregate.js';
import type { PostgresProjectPersistence } from './postgres.project.persistence.js';

export const PostgresProjectPersistenceMapper: PersistenceMapper<Project, PostgresProjectPersistence> = {
  toPersistence(entity: Project): PostgresProjectPersistence {
    return {
      id: entity.id.value,
      name: entity.name,
      created_at: new Date(entity.createdAt.iso),
    };
  },

  toDomain(data: PostgresProjectPersistence): Project {
    return Project.rehydrate(
      {
        name: data.name,
        createdAt: DateTime.create({ iso: data.created_at.toISOString() }),
      },
      UuidV7.create({ value: data.id }),
    );
  },
};
