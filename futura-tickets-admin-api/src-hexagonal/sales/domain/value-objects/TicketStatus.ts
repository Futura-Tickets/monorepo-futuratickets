/**
 * TicketStatus Value Object
 * Estados posibles de un ticket
 */
export class TicketStatus {
  private constructor(private readonly _value: string) {}

  static readonly PENDING = new TicketStatus('PENDING');
  static readonly PROCESSING = new TicketStatus('PROCESSING');
  static readonly OPEN = new TicketStatus('OPEN');
  static readonly SALE = new TicketStatus('SALE');
  static readonly SOLD = new TicketStatus('SOLD');
  static readonly CLOSED = new TicketStatus('CLOSED');
  static readonly TRANSFERED = new TicketStatus('TRANSFERED');
  static readonly EXPIRED = new TicketStatus('EXPIRED');

  static fromString(value: string): TicketStatus {
    switch (value) {
      case 'PENDING': return TicketStatus.PENDING;
      case 'PROCESSING': return TicketStatus.PROCESSING;
      case 'OPEN': return TicketStatus.OPEN;
      case 'SALE': return TicketStatus.SALE;
      case 'SOLD': return TicketStatus.SOLD;
      case 'CLOSED': return TicketStatus.CLOSED;
      case 'TRANSFERED': return TicketStatus.TRANSFERED;
      case 'EXPIRED': return TicketStatus.EXPIRED;
      default: throw new Error(`Invalid TicketStatus: ${value}`);
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: TicketStatus): boolean {
    return this._value === other._value;
  }
}

/**
 * TicketActivity Value Object
 * Actividades posibles de un ticket
 */
export class TicketActivity {
  private constructor(private readonly _value: string) {}

  static readonly EXPIRED = new TicketActivity('EXPIRED');
  static readonly PENDING = new TicketActivity('PENDING');
  static readonly PROCESSING = new TicketActivity('PROCESSING');
  static readonly PROCESSED = new TicketActivity('PROCESSED');
  static readonly GRANTED = new TicketActivity('GRANTED');
  static readonly DENIED = new TicketActivity('DENIED');
  static readonly TRANSFERING = new TicketActivity('TRANSFERING');
  static readonly TRANSFERED = new TicketActivity('TRANSFERED');

  static fromString(value: string): TicketActivity {
    switch (value) {
      case 'EXPIRED': return TicketActivity.EXPIRED;
      case 'PENDING': return TicketActivity.PENDING;
      case 'PROCESSING': return TicketActivity.PROCESSING;
      case 'PROCESSED': return TicketActivity.PROCESSED;
      case 'GRANTED': return TicketActivity.GRANTED;
      case 'DENIED': return TicketActivity.DENIED;
      case 'TRANSFERING': return TicketActivity.TRANSFERING;
      case 'TRANSFERED': return TicketActivity.TRANSFERED;
      default: throw new Error(`Invalid TicketActivity: ${value}`);
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: TicketActivity): boolean {
    return this._value === other._value;
  }
}
