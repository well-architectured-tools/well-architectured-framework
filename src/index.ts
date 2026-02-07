import type { Transport, TransportClass } from './libs/kernel/index.js';
import { FastifyTransport } from './transports/fastify/index.js';

const transports: Set<TransportClass> = new Set<TransportClass>([FastifyTransport]);

await Promise.all(
  [...transports].map((transportClass: TransportClass): Promise<void> => {
    const transport: Transport = new transportClass();
    return Promise.resolve(transport.start());
  }),
);
