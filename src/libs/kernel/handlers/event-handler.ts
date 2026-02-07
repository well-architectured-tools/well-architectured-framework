export interface EventHandler<Params> {
  execute(params: Params): Promise<void>;
}
