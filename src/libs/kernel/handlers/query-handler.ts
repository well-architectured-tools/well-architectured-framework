export interface QueryHandler<Params, Result> {
  execute(params: Params): Promise<Result>;
}
