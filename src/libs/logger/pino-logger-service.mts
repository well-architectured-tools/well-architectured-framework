import pino from 'pino';
import type { LoggerService } from './logger-service.mjs';
import { ApplicationError, errorToStringWithCauses } from '../errors/index.mjs';
import type { EnvironmentService } from '../environment/index.mjs';

export class PinoLoggerService implements LoggerService {
  private logger: pino.Logger;

  constructor(environmentService: EnvironmentService) {
    this.logger = pino({ level: environmentService.get('LOG_LEVEL') });
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (data === undefined) {
      this.logger.info(message);
    } else {
      this.logger.info(data, message);
    }
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (data === undefined) {
      this.logger.warn(message);
    } else {
      this.logger.warn(data, message);
    }
  }

  error(message: string, data?: Record<string, unknown>): void {
    if (data !== undefined && data['error'] instanceof Error) {
      const errorData: {
        message: string;
        stack: string;
        code?: string;
        details?: unknown;
      } = {
        message: data['error'].message,
        stack: errorToStringWithCauses(data['error']),
      };

      if (data['error'] instanceof ApplicationError) {
        errorData.code = data['error'].code;

        if (data['error'].details !== undefined) {
          errorData.details = data['error'].details;
        }
      }

      this.logger.error(
        {
          ...data,
          error: errorData,
        },
        message,
      );
    } else if (data === undefined) {
      this.logger.error(message);
    } else {
      this.logger.error(data, message);
    }
  }
}
