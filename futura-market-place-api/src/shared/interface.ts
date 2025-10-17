import { Account } from "src/Account/account.interface";
import { TransferFromEmail, TransferToEmail } from "src/Mail/mail.interface";
import { Order } from "src/Orders/orders.interface";
import { EmitOrder, Sale, SaleHistory, TransferAccount } from "src/Sales/sales.interface";

export interface Event {
    _id: string;
    promoter: string;
    name: string;
    description: string;
    image: string;
    capacity: number;
    commission: number;
    resale: Resale;
    artists: Artist[];
    location: Location;
    dateTime: DateTime;
    conditions: Condition[];
    isBlockchain: boolean;
    address: string;
    blockNumber: number;
    hash: string;
    url: string;
    orders: string[];
    status: EventStatus;
    tickets: Ticket[];
    maxQuantity: number;
    availableTickets: number;
}

export interface CreateEvent {
    name: string;
    description: string;
    maxQuantity: number;
    capacity: number;
    artists: Artist[];
    url?: string;
    image: string;
    ticketImage: string;
    tickets: {
        type: string;
        capacity: number;
        price: number;
    }[];
    resale: Resale;
    location: Location;
    dateTime: DateTime;
    conditions: Condition[];
    isBlockchain: boolean;
};

export class Condition {
    title: string;
    content: string;
}

export class DateTime {
    launchDate: Date;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
};

export interface UpdateEvent {
    dateTime?: {
        launchDate?: Date;
    }; 
    name?: string;
    capacity?: number;
    location?: Location;
    status?: EventStatus;
    tickets?: Ticket[];
};

export interface CreatedTicket {
    sale: string;
    event: Event;
    order: string;
    promoter: string;
    client: Account;
    type: string;
    tokenId?: number;
    price: number;
    history: SaleHistory[];
    qrCode: string;
    paymentId: string;
    timeStamp: number;
    createdAt: Date;
    isResale?: string;
}

export interface MintTicket {
    sale: string;
    event: Event;
    order: string;
    promoter: string;
    client: Account;
    type: string;
    price: number;
    history: SaleHistory[];
    qrCode: string;
    paymentId: string;
    timeStamp: number;
    createdAt: Date;
    isResale?: string;
}

export interface TransferResaleTicket {
    sale: string;
    event: Event;
    order: string;
    promoter: string;
    client: Account;
    type: string;
    price: number;
    history: SaleHistory[];
    qrCode: string;
    paymentId: string;
    timeStamp: number;
    createdAt: Date;
    isResale?: string;
}

export interface TransferTicket {
    tokenId: number;
    ticket: Sale;
    createdOrder: Order;
    createdSale: Sale;
    ticketEvent: Event;
    ticketClient: Account;
    account: Account;
    history: SaleHistory[];
    from: TransferAccount;
    to: TransferAccount;
    transferFromEmail: TransferFromEmail;
    transferToEmail: TransferToEmail;
    emitFromOrder: EmitOrder;
    emitToOrder: EmitOrder;
};

export interface TransferToUpdate {
    blockNumber: number;
    hash: string;
    from: string;
    to: string;
    tokenId: number;
};

export interface ConfirmTransferTicket {
    isResale?: boolean;
};

export interface TransferToTicket {
    name: string;
    email: string;
    lastName: string;
    phone?: string;
  }

export class Location {
    address: string;
    city: string;
    country: string;
    postalCode: string;
    venue: string;
    lat: number;
    lon: number;
}

export class Expense {
    description: string;
    amount: number;
}

export class Ticket {
    type: string;
    amount: number;
    price: number;
}

export class Resale {
    isResale: boolean;
    isActive: boolean;
    maxPrice: number;
    royalty: number;
}

export class Artist {
    name: string;
    image: string;
};

export enum EventStatus {
    HOLD = "HOLD",
    CREATED = "CREATED",
    LAUNCHED = "LAUNCHED",
    LIVE = "LIVE",
    CLOSED = "CLOSED"
};

export enum TicketStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    OPEN = "OPEN",
    SALE = "SALE",
    SOLD = "SOLD",
    CLOSED = "CLOSED",
    TRANSFERED = "TRANSFERED",
    EXPIRED = "EXPIRED"
};

export enum TicketActivity {
    EXPIRED = "EXPIRED",
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    PROCESSED = "PROCESSED",
    GRANTED = "GRANTED",
    DENIED = "DENIED",
    TRANSFERING = "TRANSFERING",
    TRANSFERED = "TRANSFERED",
};

export interface Coupon {
    _id: string;
    code: string;
    discount: number;
    eventId: string;
    maxUses: number;
    created: Date;
    expiryDate: Date;
}

export interface Promocode {
  _id: string;
  code: string;
  email: string;
  name: string;
  lastName: string;
  eventId: string;
  created: Date;
}