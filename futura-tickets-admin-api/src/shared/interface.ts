import { Account } from '../Account/account.interface';
import { TransferFromEmail, TransferToEmail } from '../Mail/mail.interface';
import { Order } from '../Orders/orders.interface';
import { Sale, SaleHistory, TransferAccount } from '../Sales/sales.interface';

export interface Event {
  _id: string;
  promoter: string;
  name: string;
  description: string;
  image: string;
  capacity: number;
  commission: number;
  availableTickets: number;
  resale: Resale;
  artists: Artist[];
  location: Location;
  dateTime: DateTime;
  conditions: Condition[];
  faqs: Faq[];
  isBlockchain: boolean;
  address: string;
  blockNumber: number;
  hash: string;
  url: string;
  orders: string[];
  status: EventStatus;
  tickets: Ticket[];
  ticketLots: TicketLot[];
  genres: string[];
}

export interface CreateEvent {
  name: string;
  description: string;
  genres: string[];
  maxQuantity: number;
  availableTickets: number;
  capacity: number;
  artists: Artist[];
  url: string;
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
  faqs: Faq[];
  isBlockchain: boolean;
}

export interface EditEvent {
  name: string;
  description: string;
  genre: string[];
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
  faqs: Faq[];
  genres: string[];
}

export class DateTime {
  launchDate?: Date;
  startDate: Date;
  endDate: Date;
}

export interface UpdateEvent {
  dateTime?: {
    launchDate?: Date;
  };
  name?: string;
  capacity?: number;
  location?: Location;
  status?: EventStatus;
  tickets?: Ticket[];
}

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
  paymentId?: string;
  timeStamp: number;
  createdAt: Date;
  isResale?: string;
  isInvitation?: boolean;
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
  paymentId?: string;
  timeStamp: number;
  createdAt: Date;
  isResale?: string;
  isInvitation?: boolean;
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
  paymentId?: string;
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
}

export interface TransferToUpdate {
  blockNumber: number;
  hash: string;
  from: string;
  to: string;
  tokenId: number;
}

export interface ConfirmTransferTicket {
  isResale?: boolean;
}

export interface TransferToTicket {
  name: string;
  email: string;
  lastName: string;
  birthdate: Date;
  phone?: string;
}

export class Location {
  venue: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
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

export class TicketLot {
  type: string;
  ticketLotItems: {
    amount: number;
    price: number;
    status: boolean;
  }[];
}

export class Resale {
  isResale: boolean;
  isActive: boolean;
  minPrice: number;
  maxPrice: number;
  royalty: number;
}

export class Artist {
  name: string;
  image: string;
}

export enum EventStatus {
  HOLD = 'HOLD',
  CREATED = 'CREATED',
  LAUNCHED = 'LAUNCHED',
  LIVE = 'LIVE',
  CLOSED = 'CLOSED',
}

export enum TicketStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  OPEN = 'OPEN',
  SALE = 'SALE',
  SOLD = 'SOLD',
  CLOSED = 'CLOSED',
  TRANSFERED = 'TRANSFERED',
  EXPIRED = 'EXPIRED',
}

export enum TicketActivity {
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  TRANSFERING = 'TRANSFERING',
  TRANSFERED = 'TRANSFERED',
}

export interface Invitation {
  _id: string;
  email: string;
  quantity: number;
  created: Date;
}

export interface CreateCoupon {
  code: string;
  discount: number;
  eventId: string;
  created: Date;
  expiryDate: Date;
  maxUses: number;
}

export interface Coupon {
  _id: string;
  code: string;
  discount: number;
  eventId: string;
  created: Date;
  expiryDate: Date;
  maxUses: number;
}

export class Condition {
  title: string;
  description: string;
}

export class Faq {
  title: string;
  description: string;
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
