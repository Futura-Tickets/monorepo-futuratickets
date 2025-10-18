import { Account } from '../Account/account.interface';

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
  transferToAccount: {
    name: string;
    email: string;
    lastName: string;
  };
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
  transferFromAccount: {
    name: string;
    email: string;
    lastName: string;
  };
}

export interface AccountConfirmation {
  email: string;
  password: string;
}
