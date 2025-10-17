/**
 * Money Value Object
 * Representa una cantidad monetaria
 */
export class Money {
  constructor(private readonly _value: number) {
    if (_value < 0) {
      throw new Error('Money cannot be negative');
    }
  }

  get value(): number {
    return this._value;
  }

  add(other: Money): Money {
    return new Money(this._value + other._value);
  }

  subtract(other: Money): Money {
    return new Money(this._value - other._value);
  }

  multiply(factor: number): Money {
    return new Money(this._value * factor);
  }

  greaterThan(other: Money): boolean {
    return this._value > other._value;
  }

  lessThan(other: Money): boolean {
    return this._value < other._value;
  }

  equals(other: Money): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return `$${this._value.toFixed(2)}`;
  }
}
