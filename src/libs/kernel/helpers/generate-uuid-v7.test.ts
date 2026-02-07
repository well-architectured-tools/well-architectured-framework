import { describe, expect, it } from 'vitest';
import { generateUuidV7 } from './generate-uuid-v7.js';
import { isUuidV7 } from './is-uuid-v7.js';

describe('generateUuidV7', (): void => {
  it('should generate UUIDv7', (): void => {
    const result: string = generateUuidV7();
    expect(isUuidV7(result)).toBe(true);
  });

  it('should generate UUIDv7 with matcher', (): void => {
    const result: string = generateUuidV7();
    expect(result).toBeUuidV7();
  });
});
