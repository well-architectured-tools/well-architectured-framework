import { Taxonomy } from '../../../domain/aggregates/taxonomy.aggregate.js';

export interface TaxonomyWriteGateway {
  save(taxonomy: Taxonomy): Promise<void>;
}
