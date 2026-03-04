import 'vitest';

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeUuidV4String(): void;
    toBeUuidV7String(): void;
    toBeISODateTimeString(): void;
  }
}
