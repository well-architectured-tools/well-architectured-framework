export interface DtoMapper<TEntity, TDto> {
  toDto(entity: TEntity): TDto;
}
