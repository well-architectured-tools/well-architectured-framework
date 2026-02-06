export interface PostgresQueryResult<T> {
  rows: T[];
}

export interface PostgresService {
  query<T extends Record<string, unknown>>(sql: string, values?: unknown[]): Promise<PostgresQueryResult<T>>;
  close(): Promise<void>;
  checkHealth(): Promise<void>;
}
