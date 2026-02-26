export function getBaseUrl(): string {
  // eslint-disable-next-line no-process-env
  const baseEnv: string | undefined = process.env['E2E_BASE_URL'];
  if (!baseEnv) {
    throw new Error('E2E_BASE_URL is not defined');
  }
  return baseEnv;
}
