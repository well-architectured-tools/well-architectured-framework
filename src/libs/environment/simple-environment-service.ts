import type { EnvironmentService, EnvironmentVariables } from './environment-service.js';
import { getEnvVarOrThrow } from '../kernel/index.js';

export class SimpleEnvironmentService implements EnvironmentService {
  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return getEnvVarOrThrow(key) as EnvironmentVariables[K];
  }
}
