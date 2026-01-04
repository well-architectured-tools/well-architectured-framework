import type { Transport, TransportClass } from './libs/kernel/index.mjs';
import { FastifyTransport } from './transports/fastify/index.mjs';

const transports: Set<TransportClass> = new Set<TransportClass>([FastifyTransport]);

await Promise.all(
  Array.from(transports).map((transportClass: TransportClass): void | Promise<void> => {
    const transport: Transport = new transportClass();
    return transport.start();
  }),
);
