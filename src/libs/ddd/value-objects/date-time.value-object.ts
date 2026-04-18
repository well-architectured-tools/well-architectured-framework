import { ValueObject } from '../base/value-object.js';
import { ApplicationError } from '../../kernel/index.js';
import { isISODateTimeString } from '../../kernel/index.js';

interface Props {
  iso: string;
}

export class DateTime extends ValueObject<Props> {
  get iso(): string {
    return this.props.iso;
  }

  static create(props: Props): DateTime {
    if (!isISODateTimeString(props.iso)) {
      throw new ApplicationError(
        'VALIDATION',
        'INVALID_ISO_DATE_TIME',
        'Invalid "iso" property: must be in format: YYYY-MM-DDTHH:mm:ss.sssZ',
        { details: props },
      );
    }
    return new this(props);
  }

  static createNow(): DateTime {
    const date: Date = new Date();
    return new this({ iso: date.toISOString() });
  }
}
