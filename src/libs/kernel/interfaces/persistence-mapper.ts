export interface PersistenceMapper<TEntity, TData> {
  toPersistence(entity: TEntity): TData;
  toDomain(data: TData): TEntity;
}
