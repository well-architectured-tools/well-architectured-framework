import { ApplicationError, type ApplicationErrorOptions } from './application-error.js';

export function wrapErrorToApplicationErrorAndThrow(error: unknown): never {
  if (error instanceof ApplicationError) {
    throw error;
  }

  const applicationErrorOptions: ApplicationErrorOptions = {};

  if (error instanceof Error) {
    applicationErrorOptions.cause = error;
  }

  throw new ApplicationError('UNEXPECTED', 'UNEXPECTED_ERROR', 'Unexpected Error', applicationErrorOptions);
}
