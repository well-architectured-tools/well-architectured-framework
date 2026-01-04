import type { Transport, TransportClass } from './libs/kernel/index.mjs';
import { FastifyTransport } from './transports/fastify/index.mjs';

const transports: Set<TransportClass> = new Set<TransportClass>([FastifyTransport]);

await Promise.all(
  [...transports].map((transportClass: TransportClass): Promise<void> => {
    const transport: Transport = new transportClass();
    return Promise.resolve(transport.start());
  }),
);
