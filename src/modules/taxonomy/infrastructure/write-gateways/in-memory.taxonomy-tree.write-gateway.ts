import type { TaxonomyTreeWriteGateway } from '../../interactors/shared/write-gateways/taxonomy-tree.write-gateway.js';
import { handleGatewayError } from '../../../../libs/errors/index.js';

export class InMemoryTaxonomyTreeWriteGateway implements TaxonomyTreeWriteGateway {
  save(_taxonomyTree: unknown): Promise<void> {
    try {
      throw new Error('Not implemented');
      // try {
      //   typia.assert<SomeResultType>(successResponseCode);
      // } catch (error) {
      //   handleResponseValidationError(error);
      // }
    } catch (error) {
      handleGatewayError(error);
    }
    return Promise.resolve();
  }
}
