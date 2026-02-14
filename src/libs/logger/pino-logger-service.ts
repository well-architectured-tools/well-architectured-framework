import pino from 'pino';
import type { LoggerService } from './logger-service.js';
import { ApplicationError, errorToStringWithCauses } from '../errors/index.js';
import type { EnvironmentService, EnvironmentVariables } from '../environment/index.js';

export class PinoLoggerService implements LoggerService {
  private readonly environmentService: EnvironmentService;
  private logger: pino.Logger;

  constructor(environmentService: EnvironmentService) {
    this.environmentService = environmentService;
    this.logger = pino(this.getLoggerOptions());
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

  private getLoggerOptions(): pino.LoggerOptions {
    const nodeEnv: EnvironmentVariables['NODE_ENV'] = this.environmentService.get('NODE_ENV');
    const logLevel: EnvironmentVariables['LOG_LEVEL'] = this.environmentService.get('LOG_LEVEL');

    const optionsMap: Record<EnvironmentVariables['NODE_ENV'], pino.LoggerOptions> = {
      production: { level: logLevel },
      development: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:isoTime',
            ignore: 'pid,hostname',
          },
        },
        level: logLevel,
      },
      test: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:isoTime',
            ignore: 'pid,hostname',
          },
        },
        level: logLevel,
      },
    };

    return optionsMap[nodeEnv];
  }
}
