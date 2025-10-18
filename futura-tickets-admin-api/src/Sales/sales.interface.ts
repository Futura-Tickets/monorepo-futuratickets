import { Item, OrderStatus } from '../Orders/orders.interface';
import { TicketActivity, TicketStatus } from '../shared/interface';

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
  blockchain?: BlockchainInfo; // New: Complete blockchain info
  createdAt?: Date;
  isResale?: string;
}

export interface BlockchainInfo {
  tokenId?: number;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  confirmed?: boolean;
  expectedTimestamp?: number;
}

export interface EmitOrder {
  _id?: string;
  account: {
    name: string;
    lastName: string;
    email: string;
  };
  event: string;
  promoter: string;
  resaleItems?: Item[];
  sales: EmitSale[];
  paymentId?: string;
  contactDetails: {
    name: string;
    lastName: string;
    email: string;
  };
  status: OrderStatus;
  createdAt: Date;
}

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
  blockNumber?: number;
  hash?: string;
  tokenId?: number;
  type: string;
  price: number;
  status: TicketStatus;
  createdAt: Date;
  isResale?: string;
  isTransfer?: string;
  isInvitation?: boolean;
}

export interface CreateSale {
  event: string;
  client: string;
  promoter: string;
  order: string;
  type: string;
  price: number;
  history: SaleHistory[];
  blockchain?: BlockchainInfo; // New: blockchain info on creation
  isResale?: string;
  status?: TicketStatus;
  isTransfer?: string;
  isInvitation?: boolean;
}

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
  blockchain?: BlockchainInfo; // New: update blockchain info
}

export class SaleHistory {
  activity: TicketActivity;
  reason?: string;
  blockNumber?: number;
  hash?: string;
  from?: TransferAccount;
  to?: TransferAccount;
  status?: TicketStatus;
  accessAccount?: AccessAccount;
  createdAt: Date;
}

export class Resale {
  resalePrice: number;
  resaleDate: Date;
}

export interface TransferAccount {
  _id: string;
  name: string;
  lastName: string;
  address?: string;
}

export interface AccessAccount {
  _id: string;
  email: string;
}
