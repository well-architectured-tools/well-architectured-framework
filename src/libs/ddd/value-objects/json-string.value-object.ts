import { ValueObject } from '../base/value-object.js';
import { ApplicationError } from '../../errors/index.js';
import { isJsonString } from '../../kernel/index.js';

interface Props {
  value: string;
}

export class JsonString extends ValueObject<Props> {
  get value(): string {
    return this.props.value;
  }

  static create(props: Props): JsonString {
    if (!isJsonString(props.value)) {
      throw new ApplicationError(
        'VALIDATION',
        'INVALID_JSON_STRING',
        'Invalid "value" property: must be a valid JSON string',
        { details: props },
      );
    }
    return new this(props);
  }
}
