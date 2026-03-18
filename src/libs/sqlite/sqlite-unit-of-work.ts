import type { TransactionalContext, UnitOfWork } from '../kernel/index.js';
import type { SqliteService } from './sqlite-service.js';

export class SqliteUnitOfWork implements UnitOfWork {
  private readonly sqliteService: SqliteService;

  constructor(sqliteService: SqliteService) {
    this.sqliteService = sqliteService;
  }

  run<TResult>(
    operation: (transactionalContext: TransactionalContext) => Promise<TResult>,
    existingTransactionalContext?: TransactionalContext,
  ): Promise<TResult> {
    return this.sqliteService.withTransaction(async (transactionalContext: TransactionalContext): Promise<TResult> => {
      return await operation(transactionalContext);
    }, existingTransactionalContext);
  }
}
