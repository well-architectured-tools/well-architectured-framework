import { describe, expect, it } from 'vitest';
import { generateUuidV4 } from './generate-uuid-v4.js';
import { isUuidV4 } from './is-uuid-v4.js';

describe('generateUuidV4', (): void => {
  it('should generate UUIDv4', (): void => {
    const result: string = generateUuidV4();
    expect(isUuidV4(result)).toBe(true);
  });

  it('should generate UUIDv4 with matcher', (): void => {
    const result: string = generateUuidV4();
    expect(result).toBeUuidV4();
  });
});
