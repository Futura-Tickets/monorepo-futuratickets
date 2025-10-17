import { ContactDetails, Item, OrderStatus } from "src/Orders/orders.interface";
import { TicketActivity, TicketStatus } from "src/shared/interface";

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
};

export interface EmitOrder {
  _id?: string;
  account: ContactDetails;
  event: string;
  promoter: string;
  resaleItems: Item[];
  sales: EmitSale[];
  paymentId?: string;
  contactDetails: ContactDetails;
  status: OrderStatus;
  createdAt: Date;
};

export interface EmitTransfer {
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
    phone?: string;
  };
  blockNumber?: number;
  hash?: string;
  tokenId?: number;
  type: string;
  price: number;
  status: TicketStatus;
  qrCode: string;
  createdAt: Date;
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
    phone: string;
  };
  hash?: string;
  tokenId?: number;
  blockNumber?: number;
  type: string;
  price: number;
  status: TicketStatus;
  qrCode: string;
  createdAt: Date;
}

export interface TransferTicket {
  _id?: string;
  account: string;
  event: string;
  client: string;
  promoter: string;
};

export interface EmitAccess {
  _id: string;
  order: string;
  event: string;
  promoter?: string;
  client: {
    name: string;
    lastName: string;
    email: string;
    phone?: string;
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
};

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
    phone?: string;
  };
  blockNumber?: number;
  hash?: string;
  tokenId?: number;
  type: string;
  price: number;
  status: TicketStatus;
  createdAt: Date;
  isResale?: string;
};

export interface CreateSale {
  event: string;
  client: string;
  promoter: string;
  order: string;
  type: string;
  price: number;
  history: SaleHistory[];
  isResale?: string;
  status?: TicketStatus;
  isTransfer?: string;
};

export interface UpdateSale {
  resale?: Resale;
  client?: string;
  status?: TicketStatus;
  qrCode?: string;
  blockNumber?: number;
  hash?: string;
  history?: SaleHistory[];
  tokenId?: number;
  price?: number;
};

export class SaleHistory {
  activity: TicketActivity;
  reason?: string;
  blockNumber?: number;
  hash?: string;
  from?: TransferAccount;
  to?: TransferAccount;
  status?: TicketStatus;
  createdAt: Date;
};

export class Resale {
  resalePrice: number;
  resaleDate: Date;
};

export interface TransferAccount {
  _id: string;
  name: string;
  lastName: string;
  address?: string;
}