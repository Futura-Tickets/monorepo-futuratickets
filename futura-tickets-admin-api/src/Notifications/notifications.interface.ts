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

export interface UpdateOrder {
  sales?: string[];
  status?: OrderStatus;
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

export interface CreateOrder {
  event: string;
  promoter: string;
  account?: string;
  paymentId?: string;
  items: Item[];
  resaleItems?: Item[];
  contactDetails: ContactDetails;
  sales: string[];
  status?: OrderStatus;
}

export interface CreateInvitation {
  event: string;
  promoter: string;
  item: Item;
  contactDetails: ContactDetails;
}

export class Item {
  sale?: string;
  type: string;
  amount: number;
  price: number;
}

export type NotificationType = 'ORDER' | 'RESALE' | 'TRANSFERED' | 'USER';

export interface BaseNotification {
  _id?: string;
  type: NotificationType;
  promoter: string;
  readBy: string[];
  createdAt?: Date;
}

export interface OrderNotification extends BaseNotification {
  type: 'ORDER';
  orderId: string;
}

export interface ResaleNotification extends BaseNotification {
  type: 'RESALE';
  orderId: string;
}

export interface TransferNotification extends BaseNotification {
  type: 'TRANSFERED';
  orderId: string;
}

export interface UserNotification extends BaseNotification {
  type: 'USER';
  userId: string;
}

export type Notification =
  | OrderNotification
  | ResaleNotification
  | UserNotification
  | TransferNotification;

export type CreateNotification =
  | CreateOrderNotification
  | CreateResaleNotification
  | CreateUserNotification
  | CreateTransferNotification;

export interface BaseCreateNotification {
  promoter: string;
  readBy?: [];
  createdAt?: Date;
}

export interface CreateOrderNotification extends BaseCreateNotification {
  type: 'ORDER';
  orderId: string;
}

export interface CreateResaleNotification extends BaseCreateNotification {
  type: 'RESALE';
  orderId: string;
}

export interface CreateTransferNotification extends BaseCreateNotification {
  type: 'TRANSFERED';
  orderId: string;
}

export interface CreateUserNotification extends BaseCreateNotification {
  type: 'USER';
  account: string;
}
