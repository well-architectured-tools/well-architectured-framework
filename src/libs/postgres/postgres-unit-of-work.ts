import type { TransactionalContext, UnitOfWork } from '../kernel/index.js';
import type { PostgresService } from './postgres-service.js';

export class PostgresUnitOfWork implements UnitOfWork {
  private readonly postgresService: PostgresService;

  constructor(postgresService: PostgresService) {
    this.postgresService = postgresService;
  }

  run<TResult>(
    operation: (transactionalContext: TransactionalContext) => Promise<TResult>,
    existingTransactionalContext?: TransactionalContext,
  ): Promise<TResult> {
    return this.postgresService.withTransaction(
      async (transactionalContext: TransactionalContext): Promise<TResult> => {
        return await operation(transactionalContext);
      },
      existingTransactionalContext,
    );
  }
}
