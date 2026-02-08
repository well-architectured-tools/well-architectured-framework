export interface Transport {
  start(): void | Promise<void>;
}
