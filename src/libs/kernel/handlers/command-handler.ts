export interface CommandHandler<Params> {
  execute(params: Params): Promise<void>;
}
