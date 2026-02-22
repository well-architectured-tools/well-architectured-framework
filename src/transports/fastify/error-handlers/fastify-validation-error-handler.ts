import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import type { FastifyErrorResponse } from '../responses/fastify-error-response.js';
import { type ApplicationErrorType } from '../../../libs/errors/index.js';
import { getHttpStatusCodeByApplicationErrorType } from './get-http-status-code-by-application-error-type.js';
import type { EnvironmentService } from '../../../libs/environment/index.js';
import { diContainer } from '../../../libs/dependency-injection/index.js';

export function fastifyValidationErrorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  const errorType: ApplicationErrorType = 'VALIDATION';

  const errorResponse: FastifyErrorResponse = {
    error: {
      type: errorType,
      code: 'VALIDATION_ERROR',
      message: error.message,
    },
  };

  const environmentService: EnvironmentService = diContainer.resolveType('EnvironmentService');
  if (
    environmentService.get('NODE_ENV') === 'development' &&
    error.validationContext !== undefined &&
    error.validation !== undefined
  ) {
    errorResponse.error.details = {
      validationContext: error.validationContext,
      validation: error.validation,
    };
  }

  reply.code(getHttpStatusCodeByApplicationErrorType(errorType)).send(errorResponse);
}
