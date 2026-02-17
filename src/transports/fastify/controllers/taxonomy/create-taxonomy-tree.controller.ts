import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { diContainer } from '../../../../libs/dependency-injection/index.js';
import { CreateTaxonomyTreeHandler, type CreateTaxonomyTreeParams } from '../../../../modules/taxonomy/index.js';
import { fastifyApplicationErrorHandler } from '../../error-handlers/fastify-application-error-handler.js';
import type { FastifySuccessResponse } from '../../responses/fastify-success-response.js';

export default (server: FastifyInstance): void => {
  const handler: CreateTaxonomyTreeHandler = diContainer.resolveType('CreateTaxonomyTreeHandler');

  server.post('/taxonomy/create-tree', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      await handler.execute(request.body as CreateTaxonomyTreeParams);

      const result: FastifySuccessResponse<null> = {
        data: null,
      };
      reply.code(200).send(result);
    } catch (error) {
      fastifyApplicationErrorHandler(error, request, reply);
    }
  });
};
