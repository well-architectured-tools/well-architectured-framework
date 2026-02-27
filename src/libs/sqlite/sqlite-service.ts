export interface SqliteQueryResult<T> {
  rows: T[];
}

export interface SqliteService {
  isReady(): Promise<boolean>;
  query<T extends Record<string, unknown>>(sql: string, values?: (number | string)[]): Promise<SqliteQueryResult<T>>;
  closeConnection(): Promise<void>;
}
