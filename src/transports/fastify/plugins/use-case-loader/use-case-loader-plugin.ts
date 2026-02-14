import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { collectUseCaseRouteDefinitions } from './collect-use-case-route-definitions.js';
import { registerUseCaseRoute } from './register-use-case-route.js';
import type { UseCaseRouteDefinition } from './use-case-loader-types.js';
import type { LoggerService } from '../../../../libs/logger/index.js';
import { diContainer } from '../../../../libs/dependency-injection/index.js';

export interface UseCaseLoaderPluginOptions {
  modulesDirectoryPath: string;
  routePrefix: string;
}

export const useCaseLoaderPlugin: FastifyPluginAsync<UseCaseLoaderPluginOptions> = async (
  fastify: FastifyInstance,
  options: UseCaseLoaderPluginOptions,
): Promise<void> => {
  const loggerService: LoggerService = diContainer.resolveType('LoggerService');
  const routeDefinitions: UseCaseRouteDefinition[] = await collectUseCaseRouteDefinitions(
    options.modulesDirectoryPath,
    options.routePrefix,
  );

  await Promise.all(
    routeDefinitions.map((routeDefinition: UseCaseRouteDefinition): Promise<void> => {
      return registerUseCaseRoute(fastify, routeDefinition);
    }),
  );

  loggerService.info('Use-case routes connected', {
    routes: routeDefinitions.map((routeDefinition: UseCaseRouteDefinition): string => {
      return `${routeDefinition.method} ${routeDefinition.routePath}`;
    }),
  });
};

export async function registerUseCaseLoaderPlugin(
  fastify: FastifyInstance,
  options: UseCaseLoaderPluginOptions,
): Promise<void> {
  await fastify.register(useCaseLoaderPlugin, options);
}
