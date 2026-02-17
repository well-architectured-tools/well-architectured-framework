export interface TaxonomyTreeWriteGateway {
  save(taxonomyTree: unknown): Promise<unknown>;
}
