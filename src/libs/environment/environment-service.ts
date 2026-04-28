export interface EnvironmentVariables {
  readonly LOAD_DOTENV: boolean;
  readonly NODE_ENV: 'production' | 'development' | 'test';
  readonly LOG_LEVEL: 'info' | 'warn' | 'error';
  readonly PORT: number;
  readonly POSTGRES_URL: string;
  readonly VALKEY_HOST: string;
  readonly VALKEY_PORT: number;
  readonly VALKEY_USER: string;
  readonly VALKEY_PASSWORD: string;
}

export interface EnvironmentService {
  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K];
}
