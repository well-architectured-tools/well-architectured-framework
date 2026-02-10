import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { diContainer } from '../../../libs/dependency-injection/index.js';
import type { LoggerService } from '../../../libs/logger/index.js';
import type { FastifyErrorResponse } from '../responses/fastify-error-response.js';
import { errorToStringWithCauses } from '../../../libs/errors/index.js';
import type { EnvironmentService } from '../../../libs/environment/index.js';

export function fastifyDefaultErrorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply): void {
  const loggerService: LoggerService = diContainer.resolveType('LoggerService');
  const environmentService: EnvironmentService = diContainer.resolveType('EnvironmentService');

  loggerService.error('DefaultErrorHandler', { error });

  const errorResponse: FastifyErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
    },
  };

  if (environmentService.get('NODE_ENV') === 'development') {
    errorResponse.error.stack = errorToStringWithCauses(error);
  }

  reply.code(500).send(errorResponse);
}
