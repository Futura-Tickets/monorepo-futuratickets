import { Event } from 'src/shared/interface';

export enum Roles {
  ACCESS = 'ACCESS',
  ADMIN = 'ADMIN',
  PROMOTER = 'PROMOTER',
  USER = 'USER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface Account {
  _id: string;
  name: string;
  lastName: string;
  promoter?: string;
  accessEvent?: string;
  accessPass?: string;
  email: string;
  config?: AccountConfig;
  gender?: Gender;
  birthdate?: Date;
  phone?: string;
  address?: string;
  smartAddress?: string;
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

export interface Promoter {
  _id: string;
  name: string;
  address?: string;
  key?: string;
  mnemonic?: string;
  image: string;
  events: Event[];
  clients: Account[];
  icon: string;
  createdAt: Date;
}

export class Payment {
  bank: string;
  bankAddress: string;
  iban: string;
  swift: string;
}

export interface GoogleAccount {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export interface PromoterClient {
  _id: string;
  client: string;
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

export interface CreateAccount {
  name: string;
  lastName: string;
  email: string;
  promoter?: string;
  birthdate?: Date;
  phone?: string;
  password: string;
  registered?: boolean;
  role: Roles;
}

export interface UpdateAccount {
  name?: string;
  lastName?: string;
  email?: string;
  birthdate?: Date;
  phone?: string;
  password?: string;
}

export interface UpdateAdminAccount {
  config: {
    notifications: {
      isOrderNotificationsEnabled: boolean;
      isUserNotificationsEnabled: boolean;
      isResaleNotificationsEnabled: boolean;
      isTransferNotificationsEnabled: boolean;
    };
  };
}

export interface LoginAccount {
  email: string;
  password: string;
}

export interface DecodedToken {
  account: string;
  name: string;
  lastName: string;
  email: string;
  birthdate: Date;
  phone: string;
  address: string;
  smartAddress: string;
  role: Roles;
  iat: number;
  exp: number;
}

export class AccountConfig {
  notifications: {
    isOrderNotificationsEnabled: boolean;
    isUserNotificationsEnabled: boolean;
    isResaleNotificationsEnabled: boolean;
    isTransferNotificationsEnabled: boolean;
  };
}
