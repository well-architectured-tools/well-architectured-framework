import { describe, expect, it } from 'vitest';
import { diContainer } from './di-container.mjs';
import type { EnvironmentService } from '../environment/index.mjs';

describe('diContainer: DiContainer', (): void => {
  it('should resolve value', (): void => {
    const environmentService: EnvironmentService = diContainer.resolveType('EnvironmentService');
    const variable: string = environmentService.get('LOG_LEVEL');
    expect(variable).toBeDefined();
  });
});
