import { ApplicationError, type ApplicationErrorOptions } from './index.js';

export function wrapErrorToApplicationErrorAndThrow(error: unknown): never {
  if (error instanceof ApplicationError) {
    throw error;
  }

  const applicationErrorOptions: ApplicationErrorOptions = {};

  if (error instanceof Error) {
    applicationErrorOptions.cause = error;
  }

  throw new ApplicationError('UNEXPECTED_HANDLER_ERROR', 'Unexpected Handler Error', applicationErrorOptions);
}
