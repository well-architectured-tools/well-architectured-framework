import { beforeAll, describe, expect, it } from 'vitest';
import { CreateTaxonomyHandler } from './create-taxonomy.handler.js';
import { diContainer } from '../../../../../libs/dependency-injection/index.js';
import type { CreateTaxonomyParams } from './create-taxonomy.params.js';
import type { CreateTaxonomyDto } from './create-taxonomy.dto.js';

describe('CreateTaxonomyHandler', (): void => {
  let handler: CreateTaxonomyHandler;

  beforeAll((): void => {
    handler = diContainer.resolveType('CreateTaxonomyHandler');
  });

  it('should success', async (): Promise<void> => {
    const params: CreateTaxonomyParams = {
      name: 'test',
    };

    const result: CreateTaxonomyDto = await handler.execute(params);

    expect(result.id).toBeUuidV7String();
    expect(result).toStrictEqual({
      id: expect.any(String),
      name: params.name,
    });
  });
});
