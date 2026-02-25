import { TypeGuardError } from 'typia';
import { ApplicationError } from './application-error.js';

export function handleGatewayError(error: unknown): void {
  if (error instanceof TypeGuardError) {
    throw new ApplicationError('UNEXPECTED', 'GATEWAY_RESPONSE_VALIDATION_ERROR', 'Invalid gateway response schema', {
      details: {
        path: error.path,
        expected: error.expected,
        value: error.value,
      },
      cause: error,
    });
  } else if (error instanceof Error) {
    throw new ApplicationError('UNEXPECTED', 'GATEWAY_ERROR', error.message, {
      cause: error,
    });
  } else {
    throw error;
  }
}
