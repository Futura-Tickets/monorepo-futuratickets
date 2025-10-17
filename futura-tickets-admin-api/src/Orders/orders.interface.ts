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
  blockchain?: BlockchainInfo; // Blockchain transaction info
  createdAt?: Date;
}

export interface BlockchainInfo {
  tokenId?: number; // NFT token ID
  contractAddress?: string; // Event contract address
  transactionHash?: string; // Mint transaction hash
  blockNumber?: number; // Block number where minted
  confirmed: boolean; // Whether blockchain transaction is confirmed
  expectedTimestamp: number; // Timestamp used for matching events
}

export interface UpdateOrder {
  sales?: string[];
  status?: OrderStatus;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
}

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
}

export interface CreateOrder {
  event: string;
  promoter: string;
  account?: string;
  paymentId?: string;
  items: Item[];
  resaleItems?: Item[];
  contactDetails: ContactDetails;
  sales: string[];
  status?: OrderStatus;
}

export interface CreateInvitation {
  event: string;
  promoter: string;
  item: Item;
  contactDetails: ContactDetails;
}

export class Item {
  sale?: string;
  type: string;
  amount: number;
  price: number;
}
