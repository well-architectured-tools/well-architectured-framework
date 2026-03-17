import { wrapErrorToApplicationErrorAndThrow } from '../../../../../libs/errors/index.js';
import type { OperationHandler, TransactionalContext, UnitOfWork } from '../../../../../libs/kernel/index.js';
import type { TaxonomyRepository } from '../../shared/repositories/taxonomy.repository.js';
import type { CreateTaxonomyParams } from './create-taxonomy.params.js';
import type { CreateTaxonomyDto } from './create-taxonomy.dto.js';
import { Taxonomy } from '../../../domain/aggregates/taxonomy.aggregate.js';

export class CreateTaxonomyHandler implements OperationHandler<CreateTaxonomyParams, CreateTaxonomyDto> {
  private readonly unitOfWork: UnitOfWork;
  private readonly taxonomyRepository: TaxonomyRepository;

  constructor(unitOfWork: UnitOfWork, taxonomyRepository: TaxonomyRepository) {
    this.unitOfWork = unitOfWork;
    this.taxonomyRepository = taxonomyRepository;
  }

  async execute(params: CreateTaxonomyParams): Promise<CreateTaxonomyDto> {
    try {
      return await this.unitOfWork.run(
        async (transactionalContext: TransactionalContext): Promise<CreateTaxonomyDto> => {
          const taxonomy: Taxonomy = Taxonomy.create({ name: params.name });
          await this.taxonomyRepository.save(taxonomy, transactionalContext);
          return {
            id: taxonomy.id.value,
            name: taxonomy.name,
          };
        },
      );
    } catch (error) {
      wrapErrorToApplicationErrorAndThrow(error);
    }
  }
}
