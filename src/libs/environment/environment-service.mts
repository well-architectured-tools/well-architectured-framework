export interface EnvironmentVariables {
  readonly POSTGRES_URL: string;
}

export interface EnvironmentService<K extends keyof EnvironmentVariables = keyof EnvironmentVariables> {
  get(key: K): EnvironmentVariables[K];
}
