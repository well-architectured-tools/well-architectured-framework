import { beforeAll, describe, expect, it } from 'vitest';
import { DotenvSafeEnvironmentService } from './dotenv-safe-environment-service.mjs';

describe('DotenvSafeEnvironmentService', (): void => {
  let service: DotenvSafeEnvironmentService;

  beforeAll((): void => {
    service = new DotenvSafeEnvironmentService();
  });

  it('should return value', (): void => {
    const variable: string = service.get('LOG_LEVEL');
    expect(variable).toBeDefined();
  });
});
