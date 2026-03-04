import type { TaxonomyWriteGateway } from '../../interactors/shared/write-gateways/taxonomy.write-gateway.js';
import { handleGatewayError } from '../../../../libs/errors/index.js';
import type { SqliteService } from '../../../../libs/sqlite/index.js';
import { Taxonomy } from '../../domain/aggregates/taxonomy.aggregate.js';

export class SqliteTaxonomyWriteGateway implements TaxonomyWriteGateway {
  private readonly sqliteService: SqliteService;

  constructor(sqliteService: SqliteService) {
    this.sqliteService = sqliteService;
  }

  async save(taxonomy: Taxonomy): Promise<void> {
    try {
      await this.sqliteService.query(
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
