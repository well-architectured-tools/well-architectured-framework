import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import type { Transport } from '../../libs/kernel/index.mjs';

export class FastifyTransport implements Transport {
  async start(): Promise<void> {
    const server: FastifyInstance = Fastify({
      logger: true,
    });

    server.get('/', (_request: FastifyRequest, _reply: FastifyReply): unknown => {
      return { hello: 'world' };
    });

    await server.listen({ port: 3000 });
  }
}
