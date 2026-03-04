import type { TaxonomyWriteGateway } from '../../interactors/shared/write-gateways/taxonomy.write-gateway.js';
import { handleGatewayError } from '../../../../libs/errors/index.js';
import { Taxonomy } from '../../domain/aggregates/taxonomy.aggregate.js';
import type { PostgresService } from '../../../../libs/postgres/index.js';

export class PostgresTaxonomyWriteGateway implements TaxonomyWriteGateway {
  private readonly postgresService: PostgresService;

  constructor(postgresService: PostgresService) {
    this.postgresService = postgresService;
  }

  async save(taxonomy: Taxonomy): Promise<void> {
    try {
      await this.postgresService.query(
        `
          INSERT INTO taxonomies (id, name, created_at)
          VALUES ($1, $2, $3)
        `,
        [taxonomy.id.value, taxonomy.name, taxonomy.createdAt.iso],
      );
      // TODO: save to outbox
      // typia.assert<SomeResultType>(successResponseCode);
    } catch (error) {
      handleGatewayError(error);
    }
  }
}
