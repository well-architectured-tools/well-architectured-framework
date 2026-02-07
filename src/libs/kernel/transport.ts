export interface Transport {
  start(): void | Promise<void>;
}

export type TransportClass = new () => Transport;
