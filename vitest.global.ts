import { config } from 'dotenv-safe';

export default function setup(): void {
  config();
  process.env['DOTENV_SAFE_LOADED'] = 'true';
}
