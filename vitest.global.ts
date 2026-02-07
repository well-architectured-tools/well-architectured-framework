import { config } from 'dotenv-safe';

export default function setup(): void {
  process.env['DOTENV_SAFE_LOADED'] = 'true';
  process.env['LOG_LEVEL'] = 'warn';
  config();
}
