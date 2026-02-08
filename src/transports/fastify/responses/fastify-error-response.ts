export interface FastifyErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}
