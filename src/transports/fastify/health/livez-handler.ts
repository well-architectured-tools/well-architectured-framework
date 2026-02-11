import type { FastifySuccessResponse } from '../responses/fastify-success-response.js';

export function livezHandler(): FastifySuccessResponse<{ uptime: number }> {
  return {
    data: {
      uptime: process.uptime(),
    },
  };
}
