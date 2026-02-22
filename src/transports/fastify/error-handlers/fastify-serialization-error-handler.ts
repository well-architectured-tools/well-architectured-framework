import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import type { FastifyErrorResponse } from '../responses/fastify-error-response.js';
import { type ApplicationErrorType } from '../../../libs/errors/index.js';
import { getHttpStatusCodeByApplicationErrorType } from './get-http-status-code-by-application-error-type.js';
import type { LoggerService } from '../../../libs/logger/index.js';
import { diContainer } from '../../../libs/dependency-injection/index.js';

export function fastifySerializationErrorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  const loggerService: LoggerService = diContainer.resolveType('LoggerService');

  loggerService.error('SerializationErrorHandler', { error });

  const errorType: ApplicationErrorType = 'UNEXPECTED';
  const errorResponse: FastifyErrorResponse = {
    error: {
      type: errorType,
      code: 'SERIALIZATION_ERROR',
      message: `An error occurred while serializing the response: ${error.message}`,
    },
  };

  reply.code(getHttpStatusCodeByApplicationErrorType(errorType)).send(errorResponse);
}
