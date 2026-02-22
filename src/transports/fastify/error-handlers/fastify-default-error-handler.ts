import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { diContainer } from '../../../libs/dependency-injection/index.js';
import type { LoggerService } from '../../../libs/logger/index.js';
import type { EnvironmentService } from '../../../libs/environment/index.js';
import type { FastifyErrorResponse } from '../responses/fastify-error-response.js';
import { ApplicationError, type ApplicationErrorType, errorToStringWithCauses } from '../../../libs/errors/index.js';
import { getHttpStatusCodeByApplicationErrorType } from './get-http-status-code-by-application-error-type.js';
import { fastifyValidationErrorHandler } from './fastify-validation-error-handler.js';
import { fastifyApplicationErrorHandler } from './fastify-application-error-handler.js';

export function fastifyDefaultErrorHandler(
  error: ApplicationError | FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const loggerService: LoggerService = diContainer.resolveType('LoggerService');
  const environmentService: EnvironmentService = diContainer.resolveType('EnvironmentService');

  if (error instanceof ApplicationError) {
    fastifyApplicationErrorHandler(error, request, reply);
    return;
  }

  if (['FST_ERR_VALIDATION', 'FST_ERR_CTP_INVALID_JSON_BODY', 'FST_ERR_CTP_INVALID_MEDIA_TYPE'].includes(error.code)) {
    fastifyValidationErrorHandler(error, request, reply);
    return;
  }

  loggerService.error('DefaultErrorHandler', { error });

  const errorType: ApplicationErrorType = 'UNEXPECTED';
  const errorResponse: FastifyErrorResponse = {
    error: {
      type: errorType,
      code: 'UNEXPECTED_ERROR',
      message: error.message,
    },
  };

  if (environmentService.get('NODE_ENV') === 'development') {
    errorResponse.error.stack = errorToStringWithCauses(error);
  }

  reply.code(getHttpStatusCodeByApplicationErrorType(errorType)).send(errorResponse);
}
