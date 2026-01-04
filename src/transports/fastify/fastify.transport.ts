import Fastify, { type FastifyInstance } from 'fastify';
import type { Transport } from '../../libs/kernel/index.js';

export class FastifyTransport implements Transport {
  start(): Promise<void> | void {
    const fastify: FastifyInstance = Fastify({
      logger: true,
    });

    fastify.listen({ port: 3000 }, function (err) {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
    });
  }
}
