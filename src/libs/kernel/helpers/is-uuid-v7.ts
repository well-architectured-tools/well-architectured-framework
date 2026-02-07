/**
 * Checks if the given string is a valid UUIDv7 string
 * @param value
 */
export function isUuidV7(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const uuidV7Pattern: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  return uuidV7Pattern.test(value);
}
