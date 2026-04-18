export function getEnvVarOrDefault(envVarName: string, defaultValue: string): string {
  // eslint-disable-next-line no-process-env
  return process.env[envVarName] ?? defaultValue;
}
