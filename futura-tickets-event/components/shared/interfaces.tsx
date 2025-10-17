export interface Event {
    _id: string;
    name: string;
    promoter: Promoter;
    conditions: Condition[];
    faqs: Faq[];
    dateTime: {
        launchDate: Date;
        startDate: Date;
        endDate: Date;
        startTime: Date;
        endTime: Date;
    };
    description: string;
    artists: Artist[];
    image: string;
    ticketImage: string;
    location: Location;
    symbol: string;
    capacity: number;
    maxQuantity: number;
    commission: number;
    resale: Resale;
    tickets: Ticket[];
    orders: Order[];
};

export interface Artist {
    name: string;
    image: string;
};

export interface Promoter {
    _id: string;
    name: string;
    address: string;
    key: string;
    image: string;
    events: string[];
    users: string[];
}

export interface Ticket {
    type: string;
    capacity: number;
    price: number;
};

export interface Resale {
    isResale: boolean;
    isActive: boolean;
    maxPrice: number;
    royalty: number;
}

export interface Order {
    _id: string;
    account: string;
    event: string;
    items: Item[];
    sales?: Sale[];
    paymentId: string;
    contactDetails: ContactDetails;
    status: OrderStatus;
    createdAt: Date;
};

export interface Sale {
    _id: string;
    order?: string;
    event: {
        _id: string;
        name: string;
        address: string;
        dateTime: DateTime;
    };
    client: {
        name: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    tokenId?: number;
    hash?: string;
    type: string;
    price: number;
    resale?: {
        resalePrice: number;
        resaleDate: Date;
    }
    status: TicketStatus;
    qrCode: string;
    createdAt: Date;
};

export interface DateTime {
    launchDate: Date;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
};

export enum TicketStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    OPEN = "OPEN",
    SALE = "SALE",
    SOLD = "SOLD",
    CLOSED = "CLOSED",
    EXPIRED = "EXPIRED",
    TRANSFERED = "TRANSFERED",
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
    event: string;
    promoter: string;
    account?: string;
    paymentId?: string;
    items: Item[];
    resaleItems: Item[];
    contactDetails: ContactDetails;
    couponCode?: string;
    promoCode?: string;
};

export interface ContactDetails {
    name: string;
    lastName: string;
    birthdate: Date;
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
    gender?: string;
    email: string;
    phone?: string;
    address?: string;
    balance?: number;
    role?: Roles;
    avatar?: string;
    password?: string;
    token?: string;
};

export interface Payment {
    bank: string;
    bankAddress: string;
    iban: string;
    bic: string;
}

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

export interface Item {
    sale?: string;
    type: string;
    amount: number;
    price: number;
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

export enum OrderStatus {
    PENDING = "PENDING",
    SUCCEEDED = "SUCCEEDED"
};

export type ActibeTab = 'ACCOUNT' | 'TICKETS' | 'ORDERS' | 'PAYMENT';

export interface TransferToTicket {
    name: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface TicketVerified {
    
}

export interface Condition {
    title: string;
    description: string;
};

export interface Faq {
    title: string;
    description: string;
}