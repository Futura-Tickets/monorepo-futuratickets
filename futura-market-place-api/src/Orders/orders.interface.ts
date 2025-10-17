export interface Order {
    _id: string;
    account: string;
    event: string;
    promoter: string;
    items: Item[];
    resaleItems: Item[];
    sales: string[];
    paymentId: string;
    contactDetails: ContactDetails;
    status: OrderStatus;
    commission: number;
    createdAt?: Date;
};

export interface UpdateOrder {
    sales?: string[];
    status?: OrderStatus;
    paymentId?: string;
}

export enum OrderStatus {
    PENDING = "PENDING",
    SUCCEEDED = "SUCCEEDED"
};

export class ContactDetails {
    name: string;
    lastName: string;
    email: string;
    birthdate: Date;
    phone?: string;
}

export class DeliveryAddress {
    address: string;
    postalCode: string;
    city: string;
    country: string;
};

export interface CreateOrder {
    contactDetails: ContactDetails;
    orders: {
        event: string;
        promoter: string;
        paymentId?: string;
        items: Item[];
        resaleItems?: Item[];
        couponCode?: string;
        promoCode?: string;
    }[]
}

export interface CreateNewOrder {
    event: string;
    promoter: string;
    account?: string;
    paymentId?: string;
    items: Item[];
    resaleItems?: Item[];
    couponCode?: string;
    promoCode?: string;
    contactDetails: ContactDetails;
    sales?: string[];
    status?: OrderStatus;
    commission: number;
};

export interface CreateBigOrder {
    events: string[];
    account?: string;
    paymentId?: string;
    items: Item[];
    resaleItems: Item[];
    contactDetails: ContactDetails;
    sales: string[];
    status?: OrderStatus;
    couponCode?: string;
    isTransfer?: boolean;
};

export class Item {
    sale?: string;
    type: string;
    amount: number;
    price: number;
};