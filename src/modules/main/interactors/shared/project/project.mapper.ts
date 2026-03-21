import type { Mapper } from '../../../../../libs/kernel/index.js';
import { Project } from '../../../domain/aggregates/project.aggregate.js';
import type { ProjectDto } from './project.dto.js';
import type { ProjectData } from './project.data.js';
import { DateTime, UuidV7 } from '../../../../../libs/ddd/index.js';

export const ProjectMapper: Mapper<Project, ProjectDto, ProjectData> = {
  toDto(entity: Project): ProjectDto {
    return {
      id: entity.id.value,
      name: entity.name,
    };
  },

  toPersistence(entity: Project): ProjectData {
    return {
      id: entity.id.value,
      name: entity.name,
      created_at: new Date(entity.createdAt.iso),
    };
  },

  toDomain(data: ProjectData): Project {
    return Project.rehydrate(
      {
        name: data.name,
        createdAt: DateTime.create({ iso: data.created_at.toISOString() }),
      },
      UuidV7.create({ value: data.id }),
    );
  },
};
