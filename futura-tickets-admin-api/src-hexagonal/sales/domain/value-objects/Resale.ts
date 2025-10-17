import { Money } from './Money';

/**
 * Resale Value Object
 * Representa información de reventa de un ticket
 */
export class Resale {
  private constructor(
    private readonly _isResale: boolean,
    private readonly _resalePrice: Money | null,
    private readonly _resaleDate: Date | null,
  ) {}

  static notForSale(): Resale {
    return new Resale(false, null, null);
  }

  static forSale(price: Money): Resale {
    return new Resale(true, price, new Date());
  }

  static fromPersistence(data: {
    isResale: boolean;
    resalePrice?: number;
    resaleDate?: Date;
  }): Resale {
    if (!data.isResale) {
      return Resale.notForSale();
    }

    return new Resale(
      true,
      data.resalePrice ? new Money(data.resalePrice) : null,
      data.resaleDate ?? null,
    );
  }

  get isResale(): boolean {
    return this._isResale;
  }

  get resalePrice(): Money | null {
    return this._resalePrice;
  }

  get resaleDate(): Date | null {
    return this._resaleDate;
  }

  toPersistence(): any {
    return {
      isResale: this._isResale,
      resalePrice: this._resalePrice?.value ?? undefined,
      resaleDate: this._resaleDate ?? undefined,
    };
  }
}
