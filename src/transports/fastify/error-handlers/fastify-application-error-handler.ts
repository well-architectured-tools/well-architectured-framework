import type { FastifyReply, FastifyRequest } from 'fastify';
import { diContainer } from '../../../libs/dependency-injection/index.js';
import type { LoggerService } from '../../../libs/logger/index.js';
import type { FastifyErrorResponse } from '../responses/fastify-error-response.js';
import { ApplicationError, errorToStringWithCauses } from '../../../libs/errors/index.js';
import type { EnvironmentService } from '../../../libs/environment/index.js';
import { getHttpStatusCodeByApplicationErrorType } from './get-http-status-code-by-application-error-type.js';

export function fastifyApplicationErrorHandler(
  error: ApplicationError,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  const loggerService: LoggerService = diContainer.resolveType('LoggerService');
  const environmentService: EnvironmentService = diContainer.resolveType('EnvironmentService');

  loggerService.error('ApplicationErrorHandler', { error });

  const errorResponse: FastifyErrorResponse = {
    error: {
      type: error.type,
      code: error.code,
      message: error.message,
    },
  };

  if (error.details !== undefined) {
    errorResponse.error.details = error.details;
  }

  if (environmentService.get('NODE_ENV') === 'development') {
    errorResponse.error.stack = errorToStringWithCauses(error);
  }

  reply.code(getHttpStatusCodeByApplicationErrorType(error.type)).send(errorResponse);
}
