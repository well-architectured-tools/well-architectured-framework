export interface EventHandler<TParams> {
  execute(params: TParams): Promise<void>;
}
