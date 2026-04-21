import { AggregateRoot, DateTime, UuidV7 } from '../../../../libs/ddd/index.js';

interface Props {
  name: string;
  projectId: UuidV7;
  createdAt: DateTime;
}

export class Catalog extends AggregateRoot<Props> {
  get name(): string {
    return this.props.name;
  }

  get projectId(): UuidV7 {
    return this.props.projectId;
  }

  get createdAt(): DateTime {
    return this.props.createdAt;
  }

  static create(props: Omit<Props, 'createdAt'>): Catalog {
    const createdAt: DateTime = DateTime.createNow();
    return new this({
      ...props,
      createdAt,
    });
  }

  static rehydrate(props: Props, id: UuidV7): Catalog {
    return new this(props, id);
  }
}
