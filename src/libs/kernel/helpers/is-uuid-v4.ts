/**
 * Checks if the given string is a valid UUIDv4 string
 * @param value
 */
export function isUuidV4(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const uuidV4Pattern: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  return uuidV4Pattern.test(value);
}
