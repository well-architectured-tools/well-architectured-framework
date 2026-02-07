import path from 'node:path';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import type { Transport } from '../../libs/kernel/index.js';

export class FastifyTransport implements Transport {
  async start(): Promise<void> {
    const server: FastifyInstance = Fastify({
      logger: true,
    });

    server.register(fastifyStatic, {
      root: path.join(import.meta.dirname, '../../public'),
      prefix: '/',
    });

    server.get('/', (_request: FastifyRequest, _reply: FastifyReply): unknown => {
      return { hello: 'world' };
    });

    await server.listen({ port: 3000 });
  }
}
