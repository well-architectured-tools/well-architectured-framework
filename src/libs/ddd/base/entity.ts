import { UuidV7 } from '../value-objects/uuid-v7.value-object.js';

export abstract class Entity<TProps extends Record<string, unknown>> {
  protected readonly _id: UuidV7;
  protected readonly props: TProps;

  protected constructor(props: TProps, id?: UuidV7) {
    this._id = id ?? UuidV7.createNew();
    this.props = props;
  }

  get id(): UuidV7 {
    return this._id;
  }

  equals(entity?: Entity<TProps> | null): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this.id.equals(entity.id);
  }
}
