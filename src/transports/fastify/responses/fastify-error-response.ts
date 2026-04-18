import type { ApplicationErrorType } from '../../../libs/kernel/index.js';

export interface FastifyErrorResponse {
  error: {
    type: ApplicationErrorType;
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}
