import { TicketActivity, TicketStatus } from 'src/shared/interface';

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
}

export class SaleHistory {
  activity: TicketActivity;
  reason?: string;
  blockNumber?: number;
  hash?: string;
  from?: TransferAccount;
  to?: TransferAccount;
  status?: TicketStatus;
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
