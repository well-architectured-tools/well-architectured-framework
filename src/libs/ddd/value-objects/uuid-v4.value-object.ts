import { ValueObject } from '../base/value-object.js';
import { ApplicationError } from '../../errors/index.js';
import { generateUuidV4, isUuidV4 } from '../../kernel/index.js';

interface Props {
  value: string;
}

export class UuidV4 extends ValueObject<Props> {
  get value(): string {
    return this.props.value;
  }

  static create(props: Props): UuidV4 {
    if (!isUuidV4(props.value)) {
      throw new ApplicationError('VALIDATION', 'INVALID_UUID_V4', `Invalid "value" property: must be a valid UUIDv4`, {
        details: props,
      });
    }
    return new this(props);
  }

  static createNew(): UuidV4 {
    return new this({ value: generateUuidV4() });
  }
}
