import { describe, expect, it } from 'vitest';
import { HttpClient, type HttpClientResponse } from '../helpers/http-client.js';
import { getBaseUrl } from '../helpers/get-base-url.js';
import type { FastifyErrorResponse } from '../../responses/fastify-error-response.js';

describe('Not Found Error', (): void => {
  const httpClient: HttpClient = new HttpClient(getBaseUrl());

  it('should return 404', async (): Promise<void> => {
    const notExistingRoute: string = '/page-does-not-exist';
    const response: HttpClientResponse<FastifyErrorResponse> =
      await httpClient.getJson<FastifyErrorResponse>(notExistingRoute);
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      error: {
        type: 'NOT_FOUND',
        code: 'ROUTE_NOT_FOUND',
        message: 'Route not found: GET /page-does-not-exist',
        stack: expect.any(String),
      },
    });
  });
});
