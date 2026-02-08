import { describe, expect, expectTypeOf, it } from 'vitest';
import { errorToStringWithCauses } from './error-to-string-with-causes.js';
import { ApplicationError } from './application-error.js';

describe('errorToStringWithCauses', (): void => {
  it('should return string on Error passed', (): void => {
    const result: string = errorToStringWithCauses(new Error('Test Error'));
    expectTypeOf(result).toBeString();
    expect(result.startsWith('Error: Test Error\n')).toBe(true);
  });

  it('should return string on ApplicationError passed', (): void => {
    const result: string = errorToStringWithCauses(new ApplicationError('ENTITY_NOT_FOUND', 'Test Error'));
    expectTypeOf(result).toBeString();
    expect(result.startsWith('ErrorCode: ENTITY_NOT_FOUND\nApplicationError: Test Error\n')).toBe(true);
  });

  it('should include cause of the error if passed', (): void => {
    const result: string = errorToStringWithCauses(new Error('Test Error', { cause: new Error('Cause Error') }));
    expect(result.startsWith('Error: Test Error\n')).toBe(true);
    expect(result.includes('Caused by: Error: Cause Error\n')).toBe(true);
  });
});
