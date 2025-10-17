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

export class Payment {
  bank: string;
  bankAddress: string;
  iban: string;
  swift: string;
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

export interface LoginAccount {
  email: string;
  password: string;
}

export interface DecodedToken {
  account: string;
  name: string;
  lastName: string;
  email: string;
  address: string;
  role: Roles;
  iat: number;
  exp: number;
}

export interface PromoterClient {
  _id: string;
  client: string;
}
