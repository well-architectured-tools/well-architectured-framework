import { ApplicationError } from './application-error.mjs';

export function errorToStringWithCauses(error: Error | ApplicationError): string {
  let result: string = '';

  if (error instanceof ApplicationError) {
    result += `ErrorCode: ${error.code}\n`;
  }

  if (error.stack) {
    result += error.stack;
  } else {
    result += `${error.name}: ${error.message}`;
  }

  if (error.cause instanceof Error) {
    let currentCause: Error | undefined = error.cause;
    while (currentCause) {
      result += `\nCaused by: `;

      if (currentCause.stack) {
        result += currentCause.stack;
      } else {
        result += `${currentCause.name}: ${currentCause.message}`;
      }

      // @ts-expect-error cause is officially supported but might not be typed in all contexts
      currentCause = currentCause.cause;
    }
  }

  return result
    .split('\n')
    .filter((line: string): boolean => !line.includes('node_modules'))
    .filter((line: string): boolean => !line.includes('node:'))
    .join('\n');
}
