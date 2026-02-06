export interface EnvironmentVariables {
  readonly LOG_LEVEL: 'info' | 'warn' | 'error';
  readonly POSTGRES_URL: string;
}

export interface EnvironmentService<K extends keyof EnvironmentVariables = keyof EnvironmentVariables> {
  get(key: K): EnvironmentVariables[K];
}
