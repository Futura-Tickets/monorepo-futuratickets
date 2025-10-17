import { randomUUID } from 'crypto';

/**
 * SaleId Value Object
 * Identificador único de una venta
 */
export class SaleId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('SaleId cannot be empty');
    }
  }

  static generate(): SaleId {
    return new SaleId(randomUUID());
  }

  static fromString(id: string): SaleId {
    return new SaleId(id);
  }

  get value(): string {
    return this._value;
  }

  equals(other: SaleId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
