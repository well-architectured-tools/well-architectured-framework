import { config } from 'dotenv-safe';

export default function setup(): void {
  process.env['NODE_ENV'] = 'test';
  process.env['LOG_LEVEL'] = 'warn';
  process.env['DOTENV_SAFE_LOADED'] = 'true';
  config();
}
