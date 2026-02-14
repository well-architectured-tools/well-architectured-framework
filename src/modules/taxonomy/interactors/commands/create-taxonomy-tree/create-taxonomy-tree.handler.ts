import type { CommandHandler } from '../../../../../libs/kernel/index.js';
import type { CreateTaxonomyTreeParams } from './create-taxonomy-tree.params.js';
import type { TaxonomyTreeWriteGateway } from '../../shared/write-gateways/taxonomy-tree.write-gateway.js';

export class CreateTaxonomyTreeHandler implements CommandHandler<CreateTaxonomyTreeParams> {
  private readonly taxonomyTreeWriteGateway: TaxonomyTreeWriteGateway;

  constructor(taxonomyTreeWriteGateway: TaxonomyTreeWriteGateway) {
    this.taxonomyTreeWriteGateway = taxonomyTreeWriteGateway;
  }

  async execute(params: CreateTaxonomyTreeParams): Promise<void> {
    try {
      await this.taxonomyTreeWriteGateway.save(params);
    } catch {
      // UseCaseErrorHandler.wrapErrorsToApplicationErrors(error);
    }
  }
}
