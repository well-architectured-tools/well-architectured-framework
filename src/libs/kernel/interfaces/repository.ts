import type { TransactionalContext } from './transactional-context.js';

export interface Repository<TId, TEntity, TTransactionalContext extends TransactionalContext = TransactionalContext> {
  getById(id: TId, transactionalContext?: TTransactionalContext): Promise<TEntity | null>;
  save(entity: TEntity, transactionalContext?: TTransactionalContext): Promise<void>;
  delete(id: TId, transactionalContext?: TTransactionalContext): Promise<void>;
}
