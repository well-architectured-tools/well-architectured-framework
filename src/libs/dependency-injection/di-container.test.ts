import { describe, expect, it } from 'vitest';
import { diContainer } from './di-container.js';
import type { EnvironmentService } from '../environment/index.js';

describe('diContainer: DiContainer', (): void => {
  it('should resolve value', (): void => {
    const environmentService: EnvironmentService = diContainer.resolveType('EnvironmentService');
    const variable: string = environmentService.get('LOG_LEVEL');
    expect(variable).toBeDefined();
  });
});
