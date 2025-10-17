export interface Event {
    _id: string;
    name: string;
    status: string;
}

export type RootParamList = {
    Login: undefined;
    Events: undefined;
    Scanner: { event: string };
};

export interface LoginAccount {
    email: string;
    password: string;
};

export interface Account {
    _id?: string;
    name: string;
    lastName: string;
    email: string;
    promoter: Promoter;
    phone?: string;
    address?: string;
    role?: Roles;
    avatar?: string;
    password?: string;
    token?: string;
    createdAt: Date;
};

export interface Promoter {
    _id: string;
    name: string;
    createdAt: Date;
}

export enum Roles {
    ADMIN = 'Admin',
    USER = 'User',
};

export interface TokenCheck {
    expired: boolean;
    userAddress: string;
    message: string;
};

export interface DecodedToken {
    _id: string;
    account: string;
    name: string;
    lastName: string;
    email: string;
    address: string;
    role: string;
    iat: number;
    exp: number;
};