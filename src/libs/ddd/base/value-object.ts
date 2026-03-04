import { isDeepStrictEqual } from 'node:util';

export abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(vo?: ValueObject<T> | null): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    return isDeepStrictEqual(this.props, vo.props);
  }
}
