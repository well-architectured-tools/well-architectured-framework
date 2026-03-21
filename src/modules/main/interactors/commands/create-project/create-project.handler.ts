import { wrapErrorToApplicationErrorAndThrow } from '../../../../../libs/errors/index.js';
import type { OperationHandler, TransactionalContext, UnitOfWork } from '../../../../../libs/kernel/index.js';
import type { ProjectRepository } from '../../shared/project/project.repository.js';
import type { CreateProjectParams } from './create-project.params.js';
import type { CreateProjectDto } from './create-project.dto.js';
import { Project } from '../../../domain/aggregates/project.aggregate.js';
import { ProjectMapper } from '../../shared/project/project.mapper.js';

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
          return ProjectMapper.toDto(project);
        },
      );
    } catch (error) {
      wrapErrorToApplicationErrorAndThrow(error);
    }
  }
}
