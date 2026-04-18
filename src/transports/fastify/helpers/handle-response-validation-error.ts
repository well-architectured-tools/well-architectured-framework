import { TypeGuardError } from 'typia';
import { ApplicationError } from '../../../libs/kernel/index.js';

export function handleResponseValidationError(error: unknown): void {
  if (error instanceof TypeGuardError) {
    throw new ApplicationError('UNEXPECTED', 'RESPONSE_VALIDATION_ERROR', 'Invalid response schema', {
      details: {
        path: error.path,
        expected: error.expected,
        value: error.value,
      },
      cause: error,
    });
  } else {
    throw error;
  }
}
