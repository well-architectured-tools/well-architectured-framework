import { describe, expect, it } from 'vitest';
import { ValueObject } from './value-object.js';

interface Props {
  value: string;
}

export class VO1 extends ValueObject<Props> {
  static create1(value: string): VO1 {
    return new this({ value });
  }
}

export class VO2 extends ValueObject<Props> {
  static create2(value: string): VO2 {
    return new this({ value });
  }
}

describe('ValueObject', (): void => {
  it('should equals true', (): void => {
    const vo1: VO1 = VO1.create1('test');
    const vo2: VO2 = VO2.create2('test');
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should equals false', (): void => {
    const vo1: VO1 = VO1.create1('test1');
    const vo2: VO2 = VO2.create2('test2');
    expect(vo1.equals(vo2)).toBe(false);
  });
});
