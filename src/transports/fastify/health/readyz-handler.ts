import type { FastifyReply, FastifyRequest } from 'fastify';
import { diContainer } from '../../../libs/dependency-injection/index.js';
import type { LoggerService } from '../../../libs/logger/index.js';
import type { PostgresService } from '../../../libs/postgres/index.js';
import type { FastifySuccessResponse } from '../responses/fastify-success-response.js';

export async function readyzHandler(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const loggerService: LoggerService = diContainer.resolveType('LoggerService');
  const postgresService: PostgresService = diContainer.resolveType('PostgresService');

  const checksFns: Record<string, () => Promise<boolean>> = {
    postgres: (): Promise<boolean> => postgresService.isReady(),
  };

  const entries: [string, boolean][] = await Promise.all(
    Object.entries(checksFns).map(async ([name, fn]: [string, () => Promise<boolean>]): Promise<[string, boolean]> => {
      try {
        const ok: boolean = await fn();
        return [name, ok] as const;
      } catch {
        return [name, false] as const;
      }
    }),
  );

  const checks: Record<string, boolean> = Object.fromEntries(entries);
  const ready: boolean = Object.values(checks).every(Boolean);

  if (!ready) {
    loggerService.warn('Service not ready', { checks });
  }

  const response: FastifySuccessResponse<{ ready: boolean; checks: Record<string, boolean> }> = {
    data: {
      ready,
      checks,
    },
  };

  reply.code(ready ? 200 : 503).send(response);
}
