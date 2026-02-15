import type { ApplicationErrorType } from '../../../libs/errors/index.js';

const httpStatusCodeByApplicationErrorType: Record<ApplicationErrorType, number> = {
  NOT_FOUND: 404,
  UNEXPECTED: 500,
};

export function getHttpStatusCodeByApplicationErrorType(applicationErrorType: ApplicationErrorType): number {
  return httpStatusCodeByApplicationErrorType[applicationErrorType];
}
