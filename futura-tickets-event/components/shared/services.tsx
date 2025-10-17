import { Event, DecodedToken, CreateOrder, CreateAccount, LoginAccount, Account, Order, Sale, TransferToTicket, TicketVerified } from "./interfaces";

export async function validate(token: string): Promise<DecodedToken> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/validate`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function getEvent(event: string): Promise<Event> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/events/${event}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(async(response: Response) => {
        return response.json();
    }).catch((err) => console.log(err));
};

export async function getEventResale(event: string): Promise<Sale[]> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/resale/${event}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(async(response: Response) => {
        return response.json();
    }).catch((err) => console.log(err));
};

export async function getStripeConfig(): Promise<{ config: string; }> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/config`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function createOrder(createOrder: CreateOrder): Promise<{ paymentId: string; clientSecret: string; }> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/events/create-order`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ createOrder })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function getAccountOrders(): Promise<Order[]> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function verifyTicket(event: string, ticket: string): Promise<TicketVerified> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event, ticket })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function resaleTicket(sale: string, resalePrice: number): Promise<Order[]> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/events/resale`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sale, resalePrice })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function cancelResaleTicket(sale: string): Promise<Order[]> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/events/cancel-resale`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sale })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function transferTicket(sale: string, transferToTicket: TransferToTicket): Promise<Order[]> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/events/transfer`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sale, transferToTicket })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function makePayment(paymentIntentId: string): Promise<any> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/payment`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentIntentId })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function createAccount(createAccount: CreateAccount): Promise<any> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ createAccount })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function loginAccount(loginAccount: LoginAccount): Promise<any> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loginAccount })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function loginGoogle(codeResponse: string): Promise<Account> {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/login-google`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ googleCode: codeResponse })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function validateCoupon(code: string, eventId: string): Promise<{
    valid?: boolean,
    discount?: number,
    code?: string,
    error?: string
}> {
        return await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, eventId })
        }).then(async(response: Response) => {
                return await response.json();
        }).catch(() => {
                throw new Error("Invalid coupon");
        });
}
