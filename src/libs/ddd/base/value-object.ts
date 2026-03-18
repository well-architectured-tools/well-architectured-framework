import { isDeepStrictEqual } from 'node:util';

export abstract class ValueObject<TProps> {
  protected readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  equals(vo?: ValueObject<TProps> | null): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    return isDeepStrictEqual(this.props, vo.props);
  }
}
