import { wrapErrorToApplicationErrorAndThrow } from '../../../../../libs/errors/index.js';
import type { OperationHandler } from '../../../../../libs/kernel/index.js';
import type { TaxonomyTreeWriteGateway } from '../../shared/write-gateways/taxonomy-tree.write-gateway.js';
import type { CreateTaxonomyTreeParams } from './create-taxonomy-tree.params.js';
import type { CreateTaxonomyTreeDto } from './create-taxonomy-tree.dto.js';

export class CreateTaxonomyTreeHandler implements OperationHandler<CreateTaxonomyTreeParams, CreateTaxonomyTreeDto> {
  private readonly taxonomyTreeWriteGateway: TaxonomyTreeWriteGateway;

  constructor(taxonomyTreeWriteGateway: TaxonomyTreeWriteGateway) {
    this.taxonomyTreeWriteGateway = taxonomyTreeWriteGateway;
  }

  async execute(params: CreateTaxonomyTreeParams): Promise<CreateTaxonomyTreeDto> {
    try {
      return (await this.taxonomyTreeWriteGateway.save(params)) as CreateTaxonomyTreeDto;
    } catch (error) {
      wrapErrorToApplicationErrorAndThrow(error);
    }
  }
}
