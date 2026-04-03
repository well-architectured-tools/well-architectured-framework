import type { DtoMapper } from '../../../../../libs/kernel/index.js';
import { Project } from '../../../domain/aggregates/project.aggregate.js';
import type { ProjectDto } from './project.dto.js';

export const ProjectDtoMapper: DtoMapper<Project, ProjectDto> = {
  toDto(entity: Project): ProjectDto {
    return {
      id: entity.id.value,
      name: entity.name,
    };
  },
};
