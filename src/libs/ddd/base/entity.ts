import { UuidV7 } from '../value-objects/uuid-v7.value-object.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class Entity<Props extends Record<string, any>> {
  protected readonly _id: UuidV7;
  protected readonly props: Props;

  protected constructor(props: Props, id?: UuidV7) {
    this._id = id ?? UuidV7.createNew();
    this.props = props;
  }

  get id(): string {
    return this._id.value;
  }

  equals(entity?: Entity<Props> | null): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this.id === entity.id;
  }
}
