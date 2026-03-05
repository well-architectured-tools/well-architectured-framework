export interface SqliteQueryResult<T> {
  rows: T[];
}

export type UnknownRecord = Record<string, unknown>;

export interface SqliteService {
  isReady(): Promise<boolean>;
  migrate(): Promise<void>;
  truncateAll(): Promise<void>;
  query<T extends UnknownRecord>(sql: string, values?: (number | string)[]): Promise<SqliteQueryResult<T>>;
  getById<T extends UnknownRecord>(tableName: string, id: number | string): Promise<T | null>;
  closeConnection(): Promise<void>;
}
