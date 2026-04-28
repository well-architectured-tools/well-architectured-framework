export const e2eEnvironment: Record<string, string> = {
  LOAD_DOTENV: 'false',
  NODE_ENV: 'test',
  LOG_LEVEL: 'warn',
  PORT: '4001',

  INFRA_POSTGRES_PORT: '5557',
  POSTGRES_URL: 'postgres://postgres:postgres@postgres:5432/postgres',

  INFRA_VALKEY_PORT: '6668',
  VALKEY_HOST: 'localhost',
  VALKEY_PORT: '6379',
  VALKEY_USER: 'admin',
  VALKEY_PASSWORD: 'admin',
};
