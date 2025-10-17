import { TicketStatus, TicketActivity } from '../value-objects/TicketStatus';
import { SaleId } from '../value-objects/SaleId';
import { Money } from '../value-objects/Money';
import { QRCode } from '../value-objects/QRCode';
import { Resale } from '../value-objects/Resale';
import { Transfer } from '../value-objects/Transfer';
import { SaleHistory } from '../value-objects/SaleHistory';

/**
 * Sale Entity - Aggregate Root
 * Representa un ticket vendido (venta individual)
 *
 * Principios DDD:
 * - Aggregate Root: Protege invariantes del negocio
 * - Rich Domain Model: Lógica de negocio encapsulada
 * - Value Objects: Conceptos del dominio inmutables
 */
export class Sale {
  private constructor(
    private readonly _id: SaleId,
    private readonly _orderId: string,
    private readonly _eventId: string,
    private readonly _clientId: string,
    private readonly _promoterId: string,
    private _type: string,
    private _price: Money,
    private _qrCode: QRCode | null,
    private _status: TicketStatus,
    private _activity: TicketActivity,
    private _resale: Resale,
    private _transfer: Transfer | null,
    private readonly _history: SaleHistory[],
    private readonly _isInvitation: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Factory Method - Creación de nueva venta
  static create(params: {
    orderId: string;
    eventId: string;
    clientId: string;
    promoterId: string;
    type: string;
    price: Money;
    isInvitation?: boolean;
  }): Sale {
    const now = new Date();

    return new Sale(
      SaleId.generate(),
      params.orderId,
      params.eventId,
      params.clientId,
      params.promoterId,
      params.type,
      params.price,
      null, // QR se genera después
      TicketStatus.PENDING,
      TicketActivity.PENDING,
      Resale.notForSale(),
      null,
      [],
      params.isInvitation ?? false,
      now,
      now,
    );
  }

  // Factory Method - Reconstruir desde persistencia
  static fromPersistence(data: {
    id: string;
    orderId: string;
    eventId: string;
    clientId: string;
    promoterId: string;
    type: string;
    price: number;
    qrCode: string | null;
    status: string;
    activity: string;
    resale: {
      isResale: boolean;
      resalePrice?: number;
      resaleDate?: Date;
    };
    transfer: {
      from: string;
      to: string;
    } | null;
    history: Array<{
      status: string;
      activity: string;
      date: Date;
      description?: string;
    }>;
    isInvitation: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Sale {
    return new Sale(
      SaleId.fromString(data.id),
      data.orderId,
      data.eventId,
      data.clientId,
      data.promoterId,
      data.type,
      new Money(data.price),
      data.qrCode ? new QRCode(data.qrCode) : null,
      TicketStatus.fromString(data.status),
      TicketActivity.fromString(data.activity),
      Resale.fromPersistence(data.resale),
      data.transfer ? Transfer.fromPersistence(data.transfer) : null,
      data.history.map(h => SaleHistory.fromPersistence(h)),
      data.isInvitation,
      data.createdAt,
      data.updatedAt,
    );
  }

  // Getters
  get id(): SaleId { return this._id; }
  get orderId(): string { return this._orderId; }
  get eventId(): string { return this._eventId; }
  get clientId(): string { return this._clientId; }
  get promoterId(): string { return this._promoterId; }
  get type(): string { return this._type; }
  get price(): Money { return this._price; }
  get qrCode(): QRCode | null { return this._qrCode; }
  get status(): TicketStatus { return this._status; }
  get activity(): TicketActivity { return this._activity; }
  get resale(): Resale { return this._resale; }
  get transfer(): Transfer | null { return this._transfer; }
  get history(): readonly SaleHistory[] { return this._history; }
  get isInvitation(): boolean { return this._isInvitation; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business Logic - Generar QR Code
  generateQRCode(qrCode: QRCode): void {
    if (this._qrCode !== null) {
      throw new Error('QR Code already generated');
    }
    this._qrCode = qrCode;
    this._status = TicketStatus.OPEN;
    this._activity = TicketActivity.PROCESSED;
    this.addHistory('QR Code generated and ticket opened');
    this._updatedAt = new Date();
  }

  // Business Logic - Poner en reventa
  putForResale(resalePrice: Money, maxResalePrice: Money): void {
    // Validaciones de negocio
    if (!this.canBeResold()) {
      throw new Error('Ticket cannot be resold in current status');
    }

    if (resalePrice.greaterThan(maxResalePrice)) {
      throw new Error(`Resale price cannot exceed ${maxResalePrice.value}`);
    }

    this._resale = Resale.forSale(resalePrice);
    this._status = TicketStatus.SALE;
    this.addHistory(`Ticket listed for resale at ${resalePrice.value}`);
    this._updatedAt = new Date();
  }

  // Business Logic - Cancelar reventa
  cancelResale(): void {
    if (!this._resale.isResale) {
      throw new Error('Ticket is not listed for resale');
    }

    this._resale = Resale.notForSale();
    this._status = TicketStatus.OPEN;
    this.addHistory('Resale cancelled');
    this._updatedAt = new Date();
  }

  // Business Logic - Transferir ticket
  transferTo(newOwnerId: string, newOwnerEmail: string): void {
    if (!this.canBeTransferred()) {
      throw new Error('Ticket cannot be transferred in current status');
    }

    this._transfer = Transfer.create(this._clientId, newOwnerId, newOwnerEmail);
    this._status = TicketStatus.TRANSFERED;
    this._activity = TicketActivity.TRANSFERING;
    this.addHistory(`Ticket transferred to ${newOwnerEmail}`);
    this._updatedAt = new Date();
  }

  // Business Logic - Validar entrada (access control)
  validateEntry(): void {
    if (this._status === TicketStatus.CLOSED) {
      throw new Error('Ticket already used');
    }

    if (this._status === TicketStatus.EXPIRED) {
      throw new Error('Ticket expired');
    }

    if (this._status !== TicketStatus.OPEN) {
      throw new Error('Ticket is not valid for entry');
    }

    this._status = TicketStatus.CLOSED;
    this._activity = TicketActivity.GRANTED;
    this.addHistory('Entry granted - ticket validated');
    this._updatedAt = new Date();
  }

  // Business Logic - Denegar entrada
  denyEntry(reason: string): void {
    this._activity = TicketActivity.DENIED;
    this.addHistory(`Entry denied: ${reason}`);
    this._updatedAt = new Date();
  }

  // Business Logic - Expirar ticket
  expire(): void {
    if (this._status === TicketStatus.CLOSED) {
      return; // Ya usado, no expirar
    }

    this._status = TicketStatus.EXPIRED;
    this._activity = TicketActivity.EXPIRED;
    this.addHistory('Ticket expired');
    this._updatedAt = new Date();
  }

  // Business Rules - ¿Puede revenderse?
  canBeResold(): boolean {
    return this._status === TicketStatus.OPEN &&
           this._activity === TicketActivity.PROCESSED &&
           !this._isInvitation;
  }

  // Business Rules - ¿Puede transferirse?
  canBeTransferred(): boolean {
    return (this._status === TicketStatus.OPEN ||
            this._status === TicketStatus.SALE) &&
           !this._isInvitation;
  }

  // Business Rules - ¿Está activo?
  isActive(): boolean {
    return this._status === TicketStatus.OPEN ||
           this._status === TicketStatus.SALE;
  }

  // Helper - Agregar historial
  private addHistory(description: string): void {
    this._history.push(
      SaleHistory.create(
        this._status.value,
        this._activity.value,
        description
      )
    );
  }

  // Serialización para persistencia
  toPersistence(): any {
    return {
      _id: this._id.value,
      order: this._orderId,
      event: this._eventId,
      client: this._clientId,
      promoter: this._promoterId,
      type: this._type,
      price: this._price.value,
      qrCode: this._qrCode?.value ?? null,
      status: this._status.value,
      activity: this._activity.value,
      resale: this._resale.toPersistence(),
      transfer: this._transfer?.toPersistence() ?? null,
      history: this._history.map(h => h.toPersistence()),
      isInvitation: this._isInvitation,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
