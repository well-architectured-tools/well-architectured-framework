import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import type { FastifyErrorResponse } from '../responses/fastify-error-response.js';
import { type ApplicationErrorType } from '../../../libs/errors/index.js';
import { getHttpStatusCodeByApplicationErrorType } from './get-http-status-code-by-application-error-type.js';

export function fastifyMediaTypeErrorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  const errorType: ApplicationErrorType = 'VALIDATION';

  const errorResponse: FastifyErrorResponse = {
    error: {
      type: errorType,
      code: 'VALIDATION_MEDIA_TYPE_ERROR',
      message: error.message,
    },
  };

  reply.code(getHttpStatusCodeByApplicationErrorType(errorType)).send(errorResponse);
}
