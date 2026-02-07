import 'vitest';

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeUuidV4(): void;
    toBeUuidV7(): void;
    toBeISODateTimeString(): void;
  }
}
