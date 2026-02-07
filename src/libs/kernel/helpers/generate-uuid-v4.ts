import { randomUUID } from 'node:crypto';

export function generateUuidV4(): string {
  return randomUUID();
}
