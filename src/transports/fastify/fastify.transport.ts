import path from 'node:path';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import fastifyCompress from '@fastify/compress';
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
    const server: FastifyInstance = Fastify({ logger: false });

    server.addHook('onClose', async (): Promise<void> => {
      await this.postgresService.closeConnection();
    });

    await server.register(fastifyCors, { origin: '*' });
    await server.register(fastifyCompress);

    // NEED TO ADD READINESS AND LIVENESS CHECK

    await server.register(fastifyStatic, {
      root: path.join(import.meta.dirname, '../../public'),
      prefix: '/',
    });

    server.get('/', (_request: FastifyRequest, _reply: FastifyReply): unknown => {
      return { hello: 'world' };
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

    server.listen({
      port: this.environmentService.get('PORT'),
      host: '0.0.0.0',
    }, (error: Error | null, address: string): void => {
      if (error) {
        this.loggerService.error('Server failed to start', { error, address });
      } else {
        this.loggerService.info('Server started', { address });
      }
    });
  }
}
