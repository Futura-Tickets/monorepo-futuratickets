export class SaleHistory {
  activity: TicketActivity;
  reason?: string;
  blockNumber?: number;
  hash?: string;
  from?: any;
  to?: any;
  status?: TicketStatus;
  createdAt: Date;
}

export interface TransferFromEmail {
  account: Account;
  event: {
    name: string;
    description: string;
    image: string;
  };
  ticket: {
    tokenId?: number;
    type: string;
    price: number;
  };
  transferToAccount: TransferToTicket;
}

export interface TransferToEmail {
  account: Account;
  event: {
    name: string;
    description: string;
    image: string;
  };
  ticket: {
    tokenId?: number;
    type: string;
    price: number;
  };
  transferFromAccount: TransferToTicket;
}

export interface Order {
  _id: string;
  account: string;
  event: string;
  promoter: string;
  items: Item[];
  resaleItems: Item[];
  sales: string[];
  paymentId: string;
  contactDetails: ContactDetails;
  status: OrderStatus;
  createdAt?: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
}

export class ContactDetails {
  name: string;
  lastName: string;
  email: string;
  phone?: string;
}

export class Item {
  sale?: string;
  type: string;
  amount: number;
  price: number;
}

export interface Account {
  _id: string;
  name: string;
  lastName: string;
  promoter?: string;
  accessEvent?: string;
  email: string;
  phone?: string;
  address?: string;
  key?: string;
  mnemonic?: string;
  avatar?: string;
  orders?: string[];
  role: Roles;
  identifier?: string;
  notifications?: string[];
  password?: string;
  registered?: boolean;
  token?: string;
}

export enum Roles {
  ACCESS = 'ACCESS',
  ADMIN = 'ADMIN',
  PROMOTER = 'PROMOTER',
  USER = 'USER',
}

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
}

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
  phone?: string;
}

export class Location {
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

export class Resale {
  isResale: boolean;
  isActive: boolean;
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
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  TRANSFERING = 'TRANSFERING',
  TRANSFERED = 'TRANSFERED',
}

export interface Account {
  _id: string;
  name: string;
  lastName: string;
  promoter?: string;
  accessEvent?: string;
  accessPass?: string;
  email: string;
  phone?: string;
  address?: string;
  key?: string;
  mnemonic?: string;
  avatar?: string;
  orders?: string[];
  role: Roles;
  identifier?: string;
  notifications?: string[];
  password?: string;
  registered?: boolean;
  token?: string;
}

export interface Sale {
  _id: string;
  event: string;
  promoter: string;
  order: string;
  client: string;
  tokenId: number;
  hash: string;
  blockNumber: number;
  type: string;
  price: number;
  status: TicketStatus;
  resale?: Resale;
  qrCode: string;
  history: SaleHistory[];
  createdAt?: Date;
  isResale?: string;
}

export interface Invitation {
  _id: string;
  email: string;
  quantity: number;
  created: Date;
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

export interface Promocode {
  _id: string;
  code: string;
  email: string;
  name: string;
  lastName: string;
  eventId: string;
  created: Date;
}
