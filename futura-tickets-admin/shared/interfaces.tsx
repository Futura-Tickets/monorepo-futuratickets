export interface User {
  id: number;
  username: string;
  walletAddress: string;
  address: string;
  ranking: number;
  twitter: boolean;
  telegram: boolean;
  discord: boolean;
  type: string;
}

export interface Event {
    _id: string;
    name: string;
    description: string;
    genres: string[];
    artists: Artist[];
    url: string;
    creator: string;
    creatorAddress: string;
    conditions: Condition[];
    faqs: Faq[];
    dateTime: DateTime;
    image: string;
    ticketImage: string;
    location: Location;
    symbol: string;
    address: string;
    orders: Order[];
    capacity: number;
    maxQuantity: number;
    availableTickets: number;
    status: EventStatus;
    resale: {
      isActive: boolean;
      isResale: boolean;
      royalty: number;
      minPrice: number;
      maxPrice: number;
    };
    isBlockchain: boolean;
    tickets: Ticket[];
    ticketLots: TicketLot[];
}

export interface Ticket {
    type: string;
    amount: number;
    price: number;
}

export interface Access {
  _id: string;
  client: string;
  status: TicketStatus;
}

export interface EmitSale {
  _id: string;
  order: string;
  event: {
    _id: string;
    name: string;
    address: string;
    promoter: string;
  };
  promoter?: string;
  client: {
    name: string;
    lastName: string;
    email: string;
  };
  hash?: string;
  tokenId?: number;
  type: string;
  price: number;
  resalePrice?: number;
  status: TicketStatus;
  qrCode: string;
  createdAt: Date;
  isResale?: string;
  isInvitation?: boolean;
  isTransfer?: string;
}

export interface EmitResale {
  _id: string;
  order: string;
  event: {
    _id: string;
    name: string;
    address: string;
    promoter: string;
  };
  promoter?: string;
  client: {
    name: string;
    lastName: string;
    email: string;
  };
  resale: {
    resalePrice: number;
    resaleDate: Date;
  };
  hash?: string;
  tokenId?: number;
  type: string;
  price: number;
  status: TicketStatus;
  qrCode: string;
  isResale?: string;
  isTransfer?: string;
  createdAt: Date;
}

export interface EmitAccess {
  _id: string;
  order: string;
  event: string;
  promoter?: string;
  client: {
    name: string;
    lastName: string;
    email: string;
  };
  history: SaleHistory[];
  blockNumber?: number;
  hash?: string;
  tokenId?: number;
  type: string;
  price: number;
  status: TicketStatus;
  qrCode: string;
  createdAt: Date;
}

export interface EmitOrder {
  _id?: string;
  account: string;
  event: string;
  items: Item[];
  sales: EmitSale[];
  paymentId: string;
  contactDetails: {
    name: string;
    lastName: string;
    email: string;
  };
  status: OrderStatus;
  createdAt: Date;
}

export interface Order {
  _id?: string;
  account: string;
  event: string;
  items: Item[];
  sales: Sale[];
  paymentId: string;
  contactDetails: {
    name: string;
    lastName: string;
    email: string;
  };
  status: OrderStatus;
  createdAt: Date;
}

export interface Item {
  type: string;
  amount: number;
  price: number;
}

export interface ContactDetails {
  name: string;
  lastName: string;
  email: string;
  birthdate: Date;
  phone?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
}

export interface Sale {
  _id: string;
  order?: string;
  event: {
    _id: string;
    name: string;
    address: string;
    dateTime?: DateTime;
    ticketImage?: string;
  };
  client: {
    _id?: string;
    name: string;
    lastName: string;
    email: string;
    phone?: string;
    birthdate?: Date;
  };
  history?: SaleHistory[];
  tokenId?: number;
  hash?: string;
  signature?: string;
  type: string;
  price: number;
  resale?: {
    resalePrice: number;
    resaleDate: Date;
  };
  status: TicketStatus;
  qrCode: string;
  createdAt: Date;
  isResale?: string;
  isTransfer?: string;
  isInvitation?: boolean;
}

export enum TicketStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  OPEN = 'OPEN',
  SALE = 'SALE',
  SOLD = 'SOLD',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
  TRANSFERED = 'TRANSFERED',
}

export interface TokenCheck {
  expired: boolean;
  userAddress: string;
  message: string;
}

export interface CreateEvent {
  name: string;
  description: string;
  genres: string[];
  artists: Artist[];
  capacity: number;
  maxQuantity: number;
  availableTickets: number;
  url?: string;
  image: string;
  ticketImage: string;
  tickets: TicketType[];
  ticketLots: TicketLot[];
  resale: Resale;
  location: Location;
  dateTime: DateTime;
  conditions: Condition[];
  faqs: Faq[];
}

export interface EditEvent {
  name: string;
  description: string;
  genres: string[];
  artists: Artist[];
  capacity: number;
  maxQuantity: number;
  availableTickets: number;
  url?: string;
  image: string;
  ticketImage: string;
  tickets: TicketType[];
  ticketLots: TicketLot[];
  resale: Resale;
  location: Location;
  dateTime: DateTime;
  conditions: Condition[];
  faqs: Faq[];
}

export interface Artist {
  name: string;
  image: string;
}

export interface Resale {
  isResale: boolean;
  isActive: boolean;
  minPrice: number;
  maxPrice: number;
  royalty: number;
}

export interface DateTime {
  launchDate?: Date;
  startDate: Date;
  endDate: Date;
}

export interface UpdateEvent {
  name?: string;
  capacity?: number;
  location?: Location;
  status?: EventStatus;
  tickets?: Ticket[];
}

export interface Ticket {
  type: string;
  capacity: number;
  price: number;
}

export interface MintEvent {
  eventAddress: string;
  tickets: number;
  price: number;
  email: string;
}

export interface Location {
  venue: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  lat?: number;
  lon?: number;
}

export interface Account {
  _id?: string;
  account: string;
  name: string;
  lastName: string;
  email: string;
  promoter: Promoter;
  phone?: string;
  gender?: string;
  birthdate?: Date;
  role?: Roles;
  orders: Order[];
  avatar?: string;
  password?: string;
  token?: string;
  createdAt: Date;
  accessPass?: string;
}

export interface Promoter {
  _id: string;
  name: string;
  image: string;
  icon: string;
  createdAt: Date;
  api: ApiSettings;
};

export interface ApiSettings {
  isApiEnabled: boolean;
  apiKey: string;
};

export enum Roles {
  ACCESS = 'ACCESS',
  ADMIN = 'ADMIN',
  PROMOTER = 'PROMOTER',
  USER = 'USER',
}

export interface CreateAccount {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role?: Roles;
}

export interface LoginAccount {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export enum EventStatus {
  HOLD = 'HOLD',
  CREATED = 'CREATED',
  LAUNCHED = 'LAUNCHED',
  LIVE = 'LIVE',
  CLOSED = 'CLOSED',
}

export interface SaleHistory {
  activity: TicketActivity;
  reason?: string;
  blockNumber?: number;
  hash?: string;
  from?: string;
  to?: string;
  status?: TicketStatus;
  createdAt: Date;
}

export interface AccessHistory {
  sale: string;
  event: string;
  order: string;
  client: {
    name: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  tokenId: number;
  activity: TicketActivity;
  reason?: string;
  type: string;
  price: number;
  status?: TicketStatus;
  createdAt: Date;
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

export type GroupBy = 'sales' | 'orders';

export interface PromoterClient {
  _id: string;
  client: Account;
  promoter: Account;
  createdAt: Date;
}

export interface TicketType {
  type: string;
  amount: number;
  price: number;
}

export interface TicketLot {
  type: string;
  ticketLotItems: {
    amount: number;
    price: number;
  }[]
}

export interface Invitation {}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  created: Date;
  expiryDate: Date;
  maxUses: number;
}

export interface CreateAccess {
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  registered?: boolean;
  event: string;
}

export interface CreateInvitation {
  event: string,
  item: {
    type: string;
    amount: number;
    price: number;
  },
  contactDetails: {
    name: string;
    lastName: string;
    email: string;
    phone?: string;
  }
}

export interface Condition {
  title: string;
  description: string;
}

export interface Faq {
  title: string;
  description: string;
}

export enum NotificationType {
  ORDER = 'ORDER',
  USER = 'USER',
  RESALE = 'RESALE',
  TRANSFERED = 'TRANSFERED',
  INVITATION = 'INVITATION',
}

export interface Notification {
  _id?: string;
  id: string;
  ref: string;
  type: NotificationType;
  message: string;
  readBy: string[];
  date: Date;
  orderId?: any;
  createdAt?: string;
  userId?: {
    _id: string;
    name: string;
    lastName: string;
  };
  sales?: Sale[];
  event?: Event;
}

export interface PromoCode {
  _id: string;
  code: string;
  name: string;
  lastName: string;
  email: string;
  createdAt?: string;
}

export interface PaymentMethod {
  _id?: string;
  id: string;
  type: 'bank' | 'card';
  name: string;
  number: string;
  expiryDate?: string;
  createdAt: string;
}

export interface RequestedPayment {
  _id?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  account: {
    _id: string;
    name: string;
    lastName: string;
    email: string;
  };
  paymentMethod: PaymentMethod;
}

export interface FilterConfig {
  type: GroupBy;
  status: string;
  search: string;
}