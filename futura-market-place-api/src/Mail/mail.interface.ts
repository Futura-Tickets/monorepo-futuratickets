import { Account } from "src/Account/account.interface";
import { TransferToTicket } from "src/shared/interface";

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