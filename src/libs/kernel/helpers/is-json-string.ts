/**
 * Checks if the given value is a valid JSON string
 * @param value
 */
export function isJsonString(value: unknown): boolean {
  try {
    JSON.parse(value as string);
    return true;
  } catch {
    return false;
  }
}
