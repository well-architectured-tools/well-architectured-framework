import type { TransactionalContext } from '../kernel/index.js';

export interface SqliteQueryResult<T> {
  rows: T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnknownRecord = Record<string, any>;

export interface SqliteService {
  isReady(): Promise<boolean>;

  migrate(): Promise<void>;

  truncateAll(): Promise<void>;

  query<T extends UnknownRecord>(
    sql: string,
    values?: (number | string)[],
    transactionalContext?: TransactionalContext,
  ): Promise<SqliteQueryResult<T>>;

  withTransaction<TResult>(
    operation: (transactionalContext: TransactionalContext) => Promise<TResult>,
    existingTransactionalContext?: TransactionalContext,
  ): Promise<TResult>;

  getById<T extends UnknownRecord>(
    tableName: string,
    id: number | string,
    transactionalContext?: TransactionalContext,
  ): Promise<T | null>;

  closeConnection(): Promise<void>;
}
