export interface OperationHandler<TParams, TResult> {
  execute(params: TParams): Promise<TResult>;
}
