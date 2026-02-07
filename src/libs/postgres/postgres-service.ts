export interface PostgresQueryResult<T> {
  rows: T[];
}

export interface PostgresService {
  isReady(): Promise<boolean>;
  query<T extends Record<string, unknown>>(sql: string, values?: unknown[]): Promise<PostgresQueryResult<T>>;
  closeConnection(): Promise<void>;
}
