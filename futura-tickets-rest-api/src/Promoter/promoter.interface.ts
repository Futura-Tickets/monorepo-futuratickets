export interface CreatePromoter {
    name: string;
    image: string;
    icon: string;
    address?: string;
    mnemonic?: string;
    key?: string;
}

export interface Promoter {
    _id: string;
    name: string;
    address: string;
    key: string;
    image: string;
    events: string[];
    clients: string[];
    api: APISettings;
}

export interface UpdatePromoter {
    name?: string;
    image?: string;
    events?: string[];
    clients?: string[];
};

export class APISettings {
    isApiEnabled: boolean;
    apiKey: string;
};