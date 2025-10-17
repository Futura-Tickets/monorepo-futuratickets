export interface Event {
    _id: string;
    promoter: string;
    name: string;
    description: string;
    creator?: string;
    image: string;
    capacity: number;
    commission: number;
    resale: Resale;
    artists: Artist[];
    location: Location;
    dateTime: DateTime;
    conditions: Condition[];
    isBlockchain: boolean;
    address: string;
    blockNumber: number;
    hash: string;
    url: string;
    orders: string[];
    status: EventStatus;
    tickets: Ticket[];
}

export interface CreateEvent {
    name: string;
    description: string;
    creator?: string;
    maxQuantity: number;
    capacity: number;
    artists: Artist[];
    url?: string;
    image: string;
    ticketImage: string;
    tickets: {
        type: string;
        capacity: number;
        price: number;
    }[];
    resale: Resale;
    location: Location;
    dateTime: DateTime;
    conditions: Condition[];
    isBlockchain: boolean;
};

export class Condition {
    title: string;
    content: string;
}

export class DateTime {
    launchDate: Date;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
};

export interface UpdateEvent {
    dateTime?: {
        launchDate?: Date;
    }; 
    name?: string;
    description?: string;
    capacity?: number;
    location?: Location;
    status?: EventStatus;
    tickets?: Ticket[];
};

export class Location {
    venue: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    lat?: number;
    lon?: number;
}

export class Ticket {
    type: string;
    amount: number;
    price: number;
}

export class Resale {
    isResale: boolean;
    isActive: boolean;
    maxPrice: number;
    royalty: number;
}

export class Artist {
    name: string;
    image: string;
};

export enum EventStatus {
    HOLD = "HOLD",
    CREATED = "CREATED",
    LAUNCHED = "LAUNCHED",
    LIVE = "LIVE",
    CLOSED = "CLOSED"
};

export enum TicketStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    OPEN = "OPEN",
    SALE = "SALE",
    SOLD = "SOLD",
    CLOSED = "CLOSED",
    TRANSFERED = "TRANSFERED",
    EXPIRED = "EXPIRED"
};

export enum TicketActivity {
    EXPIRED = "EXPIRED",
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    PROCESSED = "PROCESSED",
    GRANTED = "GRANTED",
    DENIED = "DENIED",
    TRANSFERING = "TRANSFERING",
    TRANSFERED = "TRANSFERED",
};

export interface Invitation {
    _id: string;
    email: string;
    quantity: number;
    created: Date;
};

export interface CreateCoupon {
    code: string;
    discount: number;
    eventId: string;
    created: Date;
    expiryDate: Date;
    maxUses: number;
};

export interface Coupon {
    _id: string;
    code: string;
    discount: number;
    eventId: string;
    created: Date;
    expiryDate: Date;
    maxUses: number;
};