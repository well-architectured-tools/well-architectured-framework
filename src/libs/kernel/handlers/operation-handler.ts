export interface OperationHandler<Params, Result> {
  execute(params: Params): Promise<Result>;
}
