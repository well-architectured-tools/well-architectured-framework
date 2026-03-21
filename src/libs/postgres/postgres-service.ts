import type { TransactionalContext } from '../kernel/index.js';

export interface PostgresQueryResult<T> {
  rows: T[];
}

export interface PostgresService {
  isReady(): Promise<boolean>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query<T extends Record<string, any>>(
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
