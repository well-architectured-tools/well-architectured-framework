import type { TransactionalContext } from './transactional-context.js';

export interface UnitOfWork {
  run<TResult>(
    operation: (transactionalContext: TransactionalContext) => Promise<TResult>,
    existingTransactionalContext?: TransactionalContext,
  ): Promise<TResult>;
}
