import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import type { Transport } from '../../libs/kernel/index.mjs';

export class FastifyTransport implements Transport {
  start(): Promise<void> | void {
    const server: FastifyInstance = Fastify({
      logger: true,
    });

    server.get('/', async function (_request: FastifyRequest, _reply: FastifyReply): Promise<any> {
      return { hello: 'world' };
    });

    server.listen({ port: 3000 }, function (err) {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }
    });
  }
}
