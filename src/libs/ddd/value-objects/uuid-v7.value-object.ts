import { ValueObject } from '../base/value-object.js';
import { ApplicationError } from '../../kernel/index.js';
import { generateUuidV7, isUuidV7 } from '../../kernel/index.js';

interface Props {
  value: string;
}

export class UuidV7 extends ValueObject<Props> {
  get value(): string {
    return this.props.value;
  }

  static create(props: Props): UuidV7 {
    if (!isUuidV7(props.value)) {
      throw new ApplicationError('VALIDATION', 'INVALID_UUID_V7', `Invalid "value" property: must be a valid UUIDv7`, {
        details: props,
      });
    }
    return new this(props);
  }

  static createNew(): UuidV7 {
    return new this({ value: generateUuidV7() });
  }
}
