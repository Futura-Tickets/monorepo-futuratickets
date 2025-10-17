export interface Event {
    _id: string;
    name: string;
    promoter: string;
    conditions: string;
    date: string;
    description: string;
    image: string;
    location: Location;
    symbol: string;
    capacity: number;
    tickets: Ticket[];
    nfts: EventTicket[];
};

export interface Ticket {
    type: string;
    capacity: number;
    price: number;
};

export interface CreateEvent {
    name: string;
    creator: string;
    creatorAddress: string;
    date: string;
    description: string;
    capacity: number;
    min: number;
    max: number;
    image: string;
    location: Location;
    symbol: string;
};

export interface CreateOrder {
    contactDetails: ContactDetails;
    items: string[];
};

export interface ContactDetails {
    name: string;
    lastName: string;
    email: string;
    phone: string;
};

export interface Location {
    address: string;
    city: string;
    country: string;
};

export interface Account {
    _id?: string;
    name: string;
    lastName: string;
    email: string;
    address?: string;
    balance?: number;
    role?: Roles;
    avatar?: string;
    password?: string;
    token?: string;
};

export enum Roles {
    ADMIN = 'Admin',
    USER = 'User',
};

export interface CreateAccount {
    name: string;
    lastName: string;
    email: string;
    password: string;
};

export interface LoginAccount {
    email: string;
    password: string;
};

export interface EventTicket {
    _id?: string;
    collectionAddress: string;
    owner: Account;
    tokenId: number;
    buyPrice?: number;
    price?: number;
    status: NftStatus;
};

export type Cart = {
    [key: string]: {
        type: string;
        amount: number;
    }[]
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

export enum NftStatus {
    MINTED = "MINTED",
    HOLD = "HOLD",
    SALE = "SALE",
    SOLD = "SOLD",
};

export interface SetNftPrice {
    email: string;
    collectionAddress: string;
    tokenId: number;
    price: number;
};

export interface BuyNft {
    email: string;
    owner: string;
    collectionAddress: string;
    tokenId: number;
};

export type ActibeTab = 'ACCOUNT' | 'DELIVERY' |'PAYMENT';