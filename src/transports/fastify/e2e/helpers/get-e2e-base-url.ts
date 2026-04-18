import { getEnvVarOrDefault } from '../../../../libs/kernel/index.js';

export function getE2eBaseUrl(): string {
  return getEnvVarOrDefault('E2E_BASE_URL', 'http://localhost:4001');
}
