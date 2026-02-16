import type { TaxonomyTreeWriteGateway } from '../../interactors/shared/write-gateways/taxonomy-tree.write-gateway.js';
import { ApplicationError } from '../../../../libs/errors/index.js';

export class InMemoryTaxonomyTreeWriteGateway implements TaxonomyTreeWriteGateway {
  save(_taxonomyTree: unknown): Promise<void> {
    throw new ApplicationError('NOT_FOUND', 'SUPER_CODE', 'Atata something broken by MEEE!!!');
  }
}
