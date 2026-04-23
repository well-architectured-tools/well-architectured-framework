export const e2eEnvironment: Record<string, string> = {
  LOAD_DOTENV: 'false',
  NODE_ENV: 'test',
  LOG_LEVEL: 'warn',
  PORT: '4001',
  POSTGRES_PORT: '5557',
  POSTGRES_URL: 'postgres://postgres:postgres@postgres:5432/postgres',
};
