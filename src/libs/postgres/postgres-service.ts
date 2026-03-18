import type { TransactionalContext } from '../kernel/index.js';

export interface PostgresQueryResult<T> {
  rows: T[];
}

export interface PostgresService {
  isReady(): Promise<boolean>;

  query<T extends Record<string, unknown>>(
    sql: string,
    values?: (number | string)[],
    transactionalContext?: TransactionalContext,
  ): Promise<PostgresQueryResult<T>>;

  withTransaction<TResult>(
    operation: (transactionalContext: TransactionalContext) => Promise<TResult>,
    existingTransactionalContext?: TransactionalContext,
  ): Promise<TResult>;

  closeConnection(): Promise<void>;
}
