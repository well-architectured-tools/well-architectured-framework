import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { FastifySuccessResponse } from '../../responses/fastify-success-response.js';
import type { UseCaseRouteDefinition } from './use-case-loader-types.js';
import type { CommandHandler, QueryHandler } from '../../../../libs/kernel/index.js';
import { loadUseCaseHandler } from './load-use-case-handler.js';

export async function registerUseCaseRoute(
  fastify: FastifyInstance,
  routeDefinition: UseCaseRouteDefinition,
): Promise<void> {
  const handler: CommandHandler<unknown> | QueryHandler<unknown, unknown> = await loadUseCaseHandler(
    routeDefinition.filePath,
  );

  if (routeDefinition.method === 'POST') {
    fastify.post(
      routeDefinition.routePath,
      async (request: FastifyRequest, _reply: FastifyReply): Promise<FastifySuccessResponse<true>> => {
        await handler.execute(request.body);

        return { data: true };
      },
    );

    return;
  }

  fastify.get(
    routeDefinition.routePath,
    async (request: FastifyRequest, _reply: FastifyReply): Promise<FastifySuccessResponse<unknown>> => {
      const result: unknown = await handler.execute(request.query);

      return { data: result };
    },
  );
}
