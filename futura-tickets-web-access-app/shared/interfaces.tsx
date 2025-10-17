export interface User {
    id: number;
    username: string;
    walletAddress: string;
    address: string;
    ranking: number;
    twitter: boolean;
    telegram: boolean;
    discord: boolean;
    type: string;
};

export interface ScanResult {
    access: string;
    reason: string;
    name?: string;
    email?: string;
    type?: string;
    price?: number;
    timestamp?: number;
    qrCode?: string;
}

export interface ContactDetails {
    name: string;
    email: string;
    phone: string;
};

export interface TokenCheck {
    expired: boolean;
    userAddress: string;
    message: string;
};

export interface UpdateEvent {
    name?: string;
    capacity?: number;
    location?: Location;
    status?: EventStatus;
    tickets?: Ticket[];
};

export interface Ticket {
    type: string;
    capacity: number;
    price: number;
};

export interface Account {
    _id?: string;
    name: string;
    lastName: string;
    email: string;
    accessEvent: {
        _id: string;
        name: string;
    };
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

export interface LoginAccount {
    email: string;
    password: string;
};

export interface UserLogin {
    email: string;
    password: string;
};

export enum EventStatus {
    HOLD = "HOLD",
    CREATED = "CREATED",
    LAUNCHED = "LAUNCHED",
    CLOSED = "CLOSED"
};

export type GroupBy = 'sales' | 'orders';

export interface PromoterClient {
    _id: string;
    client: Account;
    promoter: Account;
    createdAt: Date;
}

export interface Attendant {
    _id: string;
    client: Account;
    type: string;
    price: number;
    status: TicketStatus;
};

export enum TicketStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    OPEN = "OPEN",
    SALE = "SALE",
    SOLD = "SOLD",
    CLOSED = "CLOSED",
    TRANSFERED = "TRANSFERED"
};