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
  icon: string;
  events: string[];
  clients: string[];
}

export interface UpdateApiSettings {
  isApiEnabled: boolean;
}

export class APISettings {
  isApiEnabled: boolean;
  apiKey: string;
}
