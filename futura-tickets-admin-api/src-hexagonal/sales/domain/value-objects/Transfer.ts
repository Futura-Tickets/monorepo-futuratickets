/**
 * Transfer Value Object
 * Representa una transferencia de ticket
 */
export class Transfer {
  private constructor(
    private readonly _from: string,
    private readonly _to: string,
    private readonly _toEmail: string,
    private readonly _date: Date,
  ) {}

  static create(from: string, to: string, toEmail: string): Transfer {
    return new Transfer(from, to, toEmail, new Date());
  }

  static fromPersistence(data: {
    from: string;
    to: string;
    toEmail?: string;
    date?: Date;
  }): Transfer {
    return new Transfer(
      data.from,
      data.to,
      data.toEmail ?? '',
      data.date ?? new Date(),
    );
  }

  get from(): string {
    return this._from;
  }

  get to(): string {
    return this._to;
  }

  get toEmail(): string {
    return this._toEmail;
  }

  get date(): Date {
    return this._date;
  }

  toPersistence(): any {
    return {
      from: this._from,
      to: this._to,
      toEmail: this._toEmail,
      date: this._date,
    };
  }
}
