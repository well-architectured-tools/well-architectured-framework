import type { FastifyReply, FastifyRequest } from 'fastify';
import { diContainer } from '../../../libs/dependency-injection/index.js';
import type { LoggerService } from '../../../libs/logger/index.js';
import type { FastifyErrorResponse } from '../responses/fastify-error-response.js';
import { ApplicationError, errorToStringWithCauses } from '../../../libs/errors/index.js';
import type { EnvironmentService } from '../../../libs/environment/index.js';

export function fastifyRouteNotFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  const loggerService: LoggerService = diContainer.resolveType('LoggerService');
  const environmentService: EnvironmentService = diContainer.resolveType('EnvironmentService');

  const error: ApplicationError = new ApplicationError(
    'ROUTE_NOT_FOUND',
    `Route not found: ${request.method} ${request.url}`,
  );

  loggerService.warn(error.message);

  const errorResponse: FastifyErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
    },
  };

  if (environmentService.get('NODE_ENV') === 'development') {
    errorResponse.error.stack = errorToStringWithCauses(error);
  }

  reply.code(404).send(errorResponse);
}
