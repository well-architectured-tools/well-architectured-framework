/**
 * Checks if the given string is a valid ISO date-time string in the format 'YYYY-MM-DDTHH:mm:ss.sssZ', example: '2025-05-18T14:40:32.524Z'
 * @param value
 */
export function isISODateTimeString(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const isoDatePattern: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return isoDatePattern.test(value);
}
