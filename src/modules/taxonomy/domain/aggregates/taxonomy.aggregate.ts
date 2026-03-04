import { AggregateRoot, DateTime, UuidV7 } from '../../../../libs/ddd/index.js';

interface Props {
  name: string;
  createdAt: DateTime;
}

export class Taxonomy extends AggregateRoot<Props> {
  get name(): string {
    return this.props.name;
  }

  get createdAt(): DateTime {
    return this.props.createdAt;
  }

  static create(props: Omit<Props, 'createdAt'>): Taxonomy {
    const createdAt: DateTime = DateTime.createNow();
    return new this({
      ...props,
      createdAt,
    });
  }

  static rehydrate(props: Props, id: UuidV7): Taxonomy {
    return new this(props, id);
  }
}
