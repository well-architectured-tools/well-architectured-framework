export interface EnvironmentVariables {
  readonly LOG_LEVEL: 'info' | 'warn' | 'error';
  readonly PORT: number;
  readonly POSTGRES_URL: string;
}

export interface EnvironmentService {
  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K];
}
