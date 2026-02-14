import type { TaxonomyTreeWriteGateway } from '../../interactors/shared/write-gateways/taxonomy-tree.write-gateway.js';

export class InMemoryTaxonomyTreeWriteGateway implements TaxonomyTreeWriteGateway {
  save(_taxonomyTree: unknown): Promise<void> {
    return Promise.resolve();
  }
}
