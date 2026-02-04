import { beforeAll, describe, expect, it } from 'vitest';
import { EnvironmentService } from './environment-service.mjs';

describe('EnvironmentService', (): void => {
  let service: EnvironmentService;

  beforeAll((): void => {
    service = new EnvironmentService();
  });

  it('should return value', (): void => {
    const variable: string = service.get('POSTGRES_URL');
    expect(variable).toBeDefined();
  });
});
