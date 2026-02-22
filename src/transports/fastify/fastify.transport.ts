import path from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCompress from '@fastify/compress';
import fastifyStatic from '@fastify/static';
import autoLoad from '@fastify/autoload';
import { fastifyRouteNotFoundHandler } from './error-handlers/fastify-route-not-found-handler.js';
import { fastifyDefaultErrorHandler } from './error-handlers/fastify-default-error-handler.js';
import { livezHandler } from './health/livez-handler.js';
import { readyzHandler } from './health/readyz-handler.js';
import type { Transport } from '../../libs/kernel/index.js';
import type { EnvironmentService } from '../../libs/environment/index.js';
import type { LoggerService } from '../../libs/logger/index.js';
import type { PostgresService } from '../../libs/postgres/index.js';

export class FastifyTransport implements Transport {
  private readonly environmentService: EnvironmentService;
  private readonly loggerService: LoggerService;
  private readonly postgresService: PostgresService;

  constructor(environmentService: EnvironmentService, loggerService: LoggerService, postgresService: PostgresService) {
    this.environmentService = environmentService;
    this.loggerService = loggerService;
    this.postgresService = postgresService;
  }

  async start(): Promise<void> {
    const server: FastifyInstance = Fastify({
      logger: false,
      trustProxy: false,
      ajv: {
        customOptions: {
          strict: true,
          strictSchema: true,
          strictNumbers: true,
          strictTypes: true,
          strictTuples: true,
          strictRequired: true,
          allowMatchingProperties: false,
          allowUnionTypes: false,
          validateFormats: true,
          validateSchema: true,
          coerceTypes: false,
          useDefaults: false,
          removeAdditional: 'all',
          allErrors: false,
          verbose: false,
          inlineRefs: true,
        },
      },
    });

    server.addHook('onClose', async (): Promise<void> => {
      await this.postgresService.closeConnection();
    });

    await server.register(fastifyCors, { origin: '*' });
    await server.register(fastifyCompress);

    server.setNotFoundHandler(fastifyRouteNotFoundHandler);
    server.setErrorHandler(fastifyDefaultErrorHandler);

    await server.register(fastifyStatic, {
      root: path.join(import.meta.dirname, '../../public'),
      prefix: '/',
    });

    server.get('/livez', livezHandler);
    server.get('/readyz', readyzHandler);

    await server.register(autoLoad, {
      dir: path.join(import.meta.dirname, 'controllers'),
      forceESM: true,
      dirNameRoutePrefix: false,
      encapsulate: true,
      matchFilter: /^[\\/]?(?:[a-z0-9-]+[\\/])*[a-z0-9-]+\.controller\.(?:ts|js)$/,
    });

    const close: (signal: NodeJS.Signals) => Promise<void> = async (signal: NodeJS.Signals): Promise<void> => {
      try {
        this.loggerService.info('Shutting down...', { signal });
        await server.close();
      } catch (error) {
        this.loggerService.error('Shutdown failed', { error, signal });
        process.exitCode = 1;
      }
    };

    process.once('SIGINT', (signal: NodeJS.Signals): void => {
      void close(signal);
    });
    process.once('SIGTERM', (signal: NodeJS.Signals): void => {
      void close(signal);
    });

    try {
      const address: string = await server.listen({
        port: this.environmentService.get('PORT'),
        host: '0.0.0.0',
      });
      this.loggerService.info('Server started', { address });
    } catch (error) {
      this.loggerService.error('Server failed to start', { error });
      process.exit(1);
    }
  }
}
