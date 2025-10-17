export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Payment {
  _id: string;
  promoter: string;
  account: string;
  paymentMethod: string;
  amount: number;
  status: PaymentStatus;
  date: Date;
  createdAt?: Date;
}

export interface CreatePayment {
  account: string;
  paymentMethod: string;
  amount: number;
  date?: Date;
  status?: PaymentStatus;
}

export interface UpdatePayment {
  amount?: number;
  paymentMethod?: string;
  status?: PaymentStatus;
  date?: Date;
}

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
}

export interface PaymentMethod {
  _id: string;
  promoter: string;
  type: PaymentMethodType;
  name: string;
  number: string;
  expiryDate?: Date;
  createdAt?: Date;
}

export interface CreatePaymentMethod {
  type: PaymentMethodType;
  name: string;
  number: string;
  expiryDate?: Date;
}

export interface UpdatePaymentMethod {
  type?: PaymentMethodType;
  name?: string;
  number?: string;
  expiryDate?: Date;
}
