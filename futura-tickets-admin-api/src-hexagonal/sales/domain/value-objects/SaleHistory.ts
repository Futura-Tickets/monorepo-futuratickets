/**
 * SaleHistory Value Object
 * Representa un registro en el historial de una venta
 */
export class SaleHistory {
  private constructor(
    private readonly _status: string,
    private readonly _activity: string,
    private readonly _date: Date,
    private readonly _description?: string,
  ) {}

  static create(
    status: string,
    activity: string,
    description?: string,
  ): SaleHistory {
    return new SaleHistory(status, activity, new Date(), description);
  }

  static fromPersistence(data: {
    status: string;
    activity: string;
    date: Date;
    description?: string;
  }): SaleHistory {
    return new SaleHistory(
      data.status,
      data.activity,
      data.date,
      data.description,
    );
  }

  get status(): string {
    return this._status;
  }

  get activity(): string {
    return this._activity;
  }

  get date(): Date {
    return this._date;
  }

  get description(): string | undefined {
    return this._description;
  }

  toPersistence(): any {
    return {
      status: this._status,
      activity: this._activity,
      date: this._date,
      description: this._description,
    };
  }
}
