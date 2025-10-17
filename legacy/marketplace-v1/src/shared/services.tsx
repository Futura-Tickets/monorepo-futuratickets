import { CreateEvent, Event, LoginAccount, Account, BuyNft, DecodedToken, EventTicket, SetNftPrice, CreateAccount, CreateOrder } from "./interfaces";

export async function getEvents(): Promise<Event[]> {
    return await fetch(`${process.env.REACT_APP_API_URL}/user/events`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
}

export async function createAccount(createAccount: CreateAccount): Promise<Account> {
    return await fetch(`${process.env.REACT_APP_API_URL}/accounts/create`, {
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

export async function loginAccount(loginAccount: LoginAccount): Promise<Account> {
    return await fetch(`${process.env.REACT_APP_API_URL}/accounts/login`, {
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

export async function validate(token: string): Promise<DecodedToken> {
    return await fetch(`${process.env.REACT_APP_API_URL}/accounts/validate/${token}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function getEvent(event: string): Promise<Event> {
    return await fetch(`${process.env.REACT_APP_API_URL}/user/events/${event}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function getEventByAddress(eventAddress: string): Promise<Event> {
    return await fetch(`${process.env.REACT_APP_API_URL}/events/address/${eventAddress}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function getNftsByOwner(owner: string): Promise<EventTicket[]> {
    return await fetch(`${process.env.REACT_APP_API_URL}/nfts/owner/${owner}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function buyNft(buyNft: BuyNft): Promise<any> {
    return await fetch(`${process.env.REACT_APP_API_URL}/nfts/buy`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(buyNft)
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};

export async function setAccount(account: Account): Promise<Account> {
    return await fetch(`${process.env.REACT_APP_API_URL}/accounts/save`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') as string}`
        },
        body: JSON.stringify(account)
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
}

export async function getStripeConfig(): Promise<any> {
    return await fetch(`${process.env.REACT_APP_API_URL}/stripe/config`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(async(response: Response) => {
        return await response.text();
    }).catch((err) => console.log(err));
};

export async function createOrder(createOrder: CreateOrder): Promise<any> {
    return await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') as string}`
        },
        body: JSON.stringify({ createOrder })
    }).then(async(response: Response) => {
        return await response.json();
    }).catch((err) => console.log(err));
};