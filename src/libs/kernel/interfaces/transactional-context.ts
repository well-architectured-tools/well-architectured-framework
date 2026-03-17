export interface TransactionalContext<TTransaction = unknown> {
  readonly provider: string;
  readonly transaction: TTransaction;
}
