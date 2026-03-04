export function getEnvVarOrThrow(envVarName: string): string {
  // eslint-disable-next-line no-process-env
  const value: string | undefined = process.env[envVarName];
  if (!value) {
    throw new Error(`Environment variable ${envVarName} is not defined`);
  }
  return value;
}
