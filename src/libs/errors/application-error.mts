export interface ApplicationErrorOptions {
  details?: unknown;
  cause?: Error;
}

export class ApplicationError extends Error {
  readonly code: string;
  readonly details?: unknown;
  override readonly cause?: Error;

  constructor(code: string, message: string, options?: ApplicationErrorOptions) {
    if (options?.cause === undefined) {
      super(message);
    } else {
      super(message, { cause: options.cause });
      this.cause = options.cause;
    }

    this.name = this.constructor.name;
    this.code = code;

    if (options?.details !== undefined) {
      this.details = options.details;
    }
  }
}
