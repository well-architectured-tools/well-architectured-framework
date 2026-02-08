import type { Transport } from './libs/kernel/index.js';
import { diContainer } from './libs/dependency-injection/index.js';

const transports: Transport[] = diContainer.resolveTypeAll('Transport');

await Promise.all(
  transports.map((transport: Transport): Promise<void> => {
    return Promise.resolve(transport.start());
  }),
);
