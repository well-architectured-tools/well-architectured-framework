import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { diContainer } from '../../../../libs/dependency-injection/index.js';
import {
  type CreateTaxonomyDto,
  CreateTaxonomyHandler,
  type CreateTaxonomyParams,
} from '../../../../modules/taxonomy/index.js';
import type { FastifySuccessResponse } from '../../responses/fastify-success-response.js';
import type { FastifySchema } from 'fastify/types/schema.js';
import type { FastifyErrorResponse } from '../../responses/fastify-error-response.js';
import { addTypiaAsJsonSchema } from '../../helpers/add-typia-as-json-schema.js';
import type { IJsonSchemaCollection } from 'typia/src/schemas/json/IJsonSchemaCollection.js';
import typia from 'typia';
import type { _HTTPMethods } from 'fastify/types/utils.js';
import { handleResponseValidationError } from '../../helpers/handle-response-validation-error.js';

export default (server: FastifyInstance): void => {
  const method: Lowercase<_HTTPMethods> = 'post';
  const path: string = '/taxonomy/create-tree';
  const successResponseCode: number = 200;

  const handlerName: string = 'CreateTaxonomyHandler';
  type HandlerType = CreateTaxonomyHandler;

  const handlerParamsName: string = 'CreateTaxonomyParams';
  type HandlerParamsType = CreateTaxonomyParams;

  const handlerSuccessResultName: string = 'CreateTaxonomyDto';
  type HandlerSuccessResultType = CreateTaxonomyDto;

  const typiaSchemaCollection: IJsonSchemaCollection =
    typia.json.schemas<[HandlerParamsType, FastifySuccessResponse<HandlerSuccessResultType>, FastifyErrorResponse]>();

  const schemaRefs: Record<string, string> = addTypiaAsJsonSchema(server, handlerName, typiaSchemaCollection);

  const schema: FastifySchema = {
    body: {
      $ref: schemaRefs[handlerParamsName],
    },
    response: {
      [successResponseCode]: {
        $ref: schemaRefs[`FastifySuccessResponse${handlerSuccessResultName}`],
      },
      '4xx': {
        $ref: schemaRefs['FastifyErrorResponse'],
      },
      '5xx': {
        $ref: schemaRefs['FastifyErrorResponse'],
      },
    },
  };

  const handler: HandlerType = diContainer.resolveType(handlerName);

  server[method](path, { schema }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const handlerParams: HandlerParamsType = request.body as HandlerParamsType;

    const handlerSuccessResult: HandlerSuccessResultType = await handler.execute(handlerParams);

    const successResult: FastifySuccessResponse<HandlerSuccessResultType> = {
      data: handlerSuccessResult,
    };

    try {
      typia.assert<FastifySuccessResponse<HandlerSuccessResultType>>(successResponseCode);
    } catch (error) {
      handleResponseValidationError(error);
    }

    reply.code(successResponseCode).send(successResult);
  });
};
