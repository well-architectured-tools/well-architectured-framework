import {
  wrapErrorToApplicationErrorAndThrow,
  type OperationHandler,
  type TransactionalContext,
  type UnitOfWork,
} from '../../../../../libs/kernel/index.js';
import type { ProjectRepository } from '../../shared/project/project.repository.js';
import type { CreateProjectParams } from './create-project.params.js';
import type { CreateProjectDto } from './create-project.dto.js';
import { Project } from '../../../domain/aggregates/project.aggregate.js';
import { ProjectDtoMapper } from '../../shared/project/project.dto-mapper.js';

export class CreateProjectHandler implements OperationHandler<CreateProjectParams, CreateProjectDto> {
  private readonly unitOfWork: UnitOfWork;
  private readonly projectRepository: ProjectRepository;

  constructor(unitOfWork: UnitOfWork, projectRepository: ProjectRepository) {
    this.unitOfWork = unitOfWork;
    this.projectRepository = projectRepository;
  }

  async execute(params: CreateProjectParams): Promise<CreateProjectDto> {
    try {
      return await this.unitOfWork.run(
        async (transactionalContext: TransactionalContext): Promise<CreateProjectDto> => {
          const project: Project = Project.create({ name: params.name });
          await this.projectRepository.save(project, transactionalContext);
          return ProjectDtoMapper.toDto(project);
        },
      );
    } catch (error) {
      wrapErrorToApplicationErrorAndThrow(error);
    }
  }
}
