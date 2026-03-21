export interface Mapper<TEntity, TDto, TData> {
  toDto(entity: TEntity): TDto;
  toPersistence(entity: TEntity): TData;
  toDomain(data: TData): TEntity;
}
