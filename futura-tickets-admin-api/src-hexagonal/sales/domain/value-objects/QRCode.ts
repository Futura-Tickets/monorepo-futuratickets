/**
 * QRCode Value Object
 * Representa el código QR de un ticket
 */
export class QRCode {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('QRCode cannot be empty');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: QRCode): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
