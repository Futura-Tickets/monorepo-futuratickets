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
    createdAt?: Date;
};

export interface UpdateOrder {
    sales?: string[];
    status?: OrderStatus;
}

export enum OrderStatus {
    PENDING = "PENDING",
    SUCCEEDED = "SUCCEEDED"
};

export class ContactDetails {
    name: string;
    lastName: string;
    email: string;
    phone?: string;
}

export class DeliveryAddress {
    address: string;
    postalCode: string;
    city: string;
    country: string;
};

export interface CreateOrder {
    event: string;
    promoter: string;
    account?: string;
    paymentId?: string;
    items: Item[];
    resaleItems: Item[];
    contactDetails: ContactDetails;
    sales: string[];
    status?: OrderStatus;
    isTransfer?: boolean;
};

export class Item {
    sale?: string;
    type: string;
    amount: number;
    price: number;
};