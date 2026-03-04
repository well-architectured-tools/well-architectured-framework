import { wrapErrorToApplicationErrorAndThrow } from '../../../../../libs/errors/index.js';
import type { OperationHandler } from '../../../../../libs/kernel/index.js';
import type { TaxonomyWriteGateway } from '../../shared/write-gateways/taxonomy.write-gateway.js';
import type { CreateTaxonomyParams } from './create-taxonomy.params.js';
import type { CreateTaxonomyDto } from './create-taxonomy.dto.js';
import { Taxonomy } from '../../../domain/aggregates/taxonomy.aggregate.js';

export class CreateTaxonomyHandler implements OperationHandler<CreateTaxonomyParams, CreateTaxonomyDto> {
  private readonly taxonomyWriteGateway: TaxonomyWriteGateway;

  constructor(taxonomyWriteGateway: TaxonomyWriteGateway) {
    this.taxonomyWriteGateway = taxonomyWriteGateway;
  }

  async execute(params: CreateTaxonomyParams): Promise<CreateTaxonomyDto> {
    try {
      const taxonomy: Taxonomy = Taxonomy.create({ name: params.name });
      await this.taxonomyWriteGateway.save(taxonomy);
      return {
        id: taxonomy.id.value,
        name: taxonomy.name,
      };
    } catch (error) {
      wrapErrorToApplicationErrorAndThrow(error);
    }
  }
}
