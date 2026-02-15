import type { ApplicationErrorType } from '../../../libs/errors/index.js';

export interface FastifyErrorResponse {
  error: {
    type: ApplicationErrorType;
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}
