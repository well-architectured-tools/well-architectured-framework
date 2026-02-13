import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { collectUseCaseRouteDefinitions } from './collect-use-case-route-definitions.js';
import { registerUseCaseRoute } from './register-use-case-route.js';
import type { UseCaseRouteDefinition } from './use-case-loader-types.js';

export interface UseCaseLoaderPluginOptions {
  modulesDirectoryPath: string;
  routePrefix: string;
}

export const useCaseLoaderPlugin: FastifyPluginAsync<UseCaseLoaderPluginOptions> = async (
  fastify: FastifyInstance,
  options: UseCaseLoaderPluginOptions,
): Promise<void> => {
  const routeDefinitions: UseCaseRouteDefinition[] = await collectUseCaseRouteDefinitions(
    options.modulesDirectoryPath,
    options.routePrefix,
  );

  await Promise.all(
    routeDefinitions.map((routeDefinition: UseCaseRouteDefinition): Promise<void> => {
      return registerUseCaseRoute(fastify, routeDefinition);
    }),
  );
};

export async function registerUseCaseLoaderPlugin(
  fastify: FastifyInstance,
  options: UseCaseLoaderPluginOptions,
): Promise<void> {
  await fastify.register(useCaseLoaderPlugin, options);
}
