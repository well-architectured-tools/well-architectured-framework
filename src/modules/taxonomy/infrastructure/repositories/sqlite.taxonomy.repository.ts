import type { TaxonomyRepository } from '../../interactors/shared/repositories/taxonomy.repository.js';
import type { TransactionalContext } from '../../../../libs/kernel/index.js';
import { handleGatewayError } from '../../../../libs/errors/index.js';
import type { SqliteService } from '../../../../libs/sqlite/index.js';
import { Taxonomy } from '../../domain/aggregates/taxonomy.aggregate.js';
import { UuidV7 } from '../../../../libs/ddd/index.js';

export class SqliteTaxonomyRepository implements TaxonomyRepository {
  private readonly sqliteService: SqliteService;

  constructor(sqliteService: SqliteService) {
    this.sqliteService = sqliteService;
  }

  getById(_id: UuidV7, _transactionalContext?: TransactionalContext): Promise<Taxonomy | null> {
    throw new Error('Method not implemented.');
  }

  async save(taxonomy: Taxonomy, transactionalContext?: TransactionalContext): Promise<void> {
    try {
      await this.sqliteService.query(
        `
          INSERT INTO taxonomies (id, name, created_at)
          VALUES (?, ?, ?)
        `,
        [taxonomy.id.value, taxonomy.name, taxonomy.createdAt.iso],
        transactionalContext,
      );
      // TODO: save to outbox
      // typia.assert<SomeResultType>(successResponseCode);
    } catch (error) {
      handleGatewayError(error);
    }
  }

  delete(_id: UuidV7, _transactionalContext?: TransactionalContext): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
