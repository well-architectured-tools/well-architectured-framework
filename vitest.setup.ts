import { expect } from 'vitest';
import type { MatcherState } from '@vitest/expect';
import { isUuidV4 } from './src/libs/kernel/helpers/is-uuid-v4.js';
import { isUuidV7 } from './src/libs/kernel/helpers/is-uuid-v7.js';
import { isISODateTimeString } from './src/libs/kernel/helpers/is-iso-date-time-string.js';

interface ExpectationResult {
  pass: boolean;
  message: () => string;
  // If you pass these, they will automatically appear inside a diff when
  // the matcher does not pass, so you don't need to print the diff yourself
  actual?: unknown;
  expected?: unknown;
}

expect.extend({
  toBeUuidV4(received: string, _expected: unknown): ExpectationResult {
    const { isNot }: MatcherState = this;
    return {
      pass: isUuidV4(received),
      message: (): string => `${received} is${isNot ? '' : ' not'} UuidV4`,
    };
  },
  toBeUuidV7(received: string, _expected: unknown): ExpectationResult {
    const { isNot }: MatcherState = this;
    return {
      pass: isUuidV7(received),
      message: (): string => `${received} is${isNot ? '' : ' not'} UuidV7`,
    };
  },
  toBeISODateTimeString(received: string, _expected: unknown): ExpectationResult {
    const { isNot }: MatcherState = this;
    return {
      pass: isISODateTimeString(received),
      message: (): string => `${received} is${isNot ? '' : ' not'} in the format 'YYYY-MM-DDTHH:mm:ss.sssZ'`,
    };
  },
});
