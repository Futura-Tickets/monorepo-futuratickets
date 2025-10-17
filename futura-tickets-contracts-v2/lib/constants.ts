/**
 * 🔗 Blockchain Constants
 *
 * Centralized configuration for all blockchain-related constants.
 * Import this in your backend to get network configs, addresses, etc.
 *
 * Usage:
 *   import { NETWORKS, CONTRACT_ADDRESSES, GAS_LIMITS } from '../contracts/lib/constants';
 *   const network = NETWORKS.baseSepolia;
 */

export const NETWORKS = {
  hardhat: {
    name: "Hardhat Local",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: null,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: true,
  },
  baseSepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: (apiKey: string) =>
      `https://base-sepolia.g.alchemy.com/v2/${apiKey}`,
    blockExplorer: "https://sepolia.basescan.org",
    faucet: "https://faucet.quicknode.com/base/sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: true,
  },
  base: {
    name: "Base Mainnet",
    chainId: 8453,
    rpcUrl: (apiKey: string) =>
      `https://base-mainnet.g.alchemy.com/v2/${apiKey}`,
    blockExplorer: "https://basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: false,
  },
} as const;

/**
 * Contract addresses per network
 * Update these after deployment
 */
export const CONTRACT_ADDRESSES = {
  hardhat: {
    factoryAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
  baseSepolia: {
    factoryAddress: process.env.FACTORY_ADDRESS_BASE_SEPOLIA || "",
  },
  base: {
    factoryAddress: process.env.FACTORY_ADDRESS_BASE_MAINNET || "",
  },
} as const;

/**
 * Estimated gas limits for common operations
 */
export const GAS_LIMITS = {
  deployFactory: 3_000_000,
  createEvent: 2_500_000,
  mintNFT: 200_000,
  setNFTPrice: 100_000,
  transferNFT: 100_000,
  setTicketStatus: 75_000,
  cancelResale: 75_000,
  pause: 50_000,
  unpause: 50_000,
} as const;

/**
 * Default royalty percentage (5%)
 */
export const DEFAULT_ROYALTY_PERCENTAGE = 5;

/**
 * Maximum royalty percentage (100%)
 */
export const MAX_ROYALTY_PERCENTAGE = 100;

/**
 * Ticket statuses
 */
export enum TicketStatus {
  OPEN = 0,
  CLOSED = 1,
  SALE = 2,
}

/**
 * Ticket status names
 */
export const TICKET_STATUS_NAMES = {
  [TicketStatus.OPEN]: "OPEN",
  [TicketStatus.CLOSED]: "CLOSED",
  [TicketStatus.SALE]: "SALE",
} as const;

/**
 * Default max supply for events
 */
export const DEFAULT_MAX_SUPPLY = 10_000;

/**
 * Gas price settings (in gwei)
 */
export const GAS_PRICE_SETTINGS = {
  hardhat: {
    maxFeePerGas: "auto",
    maxPriorityFeePerGas: "auto",
  },
  baseSepolia: {
    maxFeePerGas: "2", // 2 gwei
    maxPriorityFeePerGas: "1", // 1 gwei
  },
  base: {
    maxFeePerGas: "auto",
    maxPriorityFeePerGas: "auto",
  },
} as const;

/**
 * Transaction confirmation blocks
 */
export const CONFIRMATION_BLOCKS = {
  hardhat: 1,
  baseSepolia: 5,
  base: 10,
} as const;

/**
 * Helper: Get network by chain ID
 */
export function getNetworkByChainId(chainId: number) {
  for (const [key, network] of Object.entries(NETWORKS)) {
    if (network.chainId === chainId) {
      return { key, ...network };
    }
  }
  return null;
}

/**
 * Helper: Get factory address for network
 */
export function getFactoryAddress(network: keyof typeof NETWORKS): string {
  const address = CONTRACT_ADDRESSES[network]?.factoryAddress;
  if (!address) {
    throw new Error(`Factory address not configured for network: ${network}`);
  }
  return address;
}

/**
 * Helper: Validate address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Helper: Validate private key format
 */
export function isValidPrivateKey(privateKey: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
}

/**
 * Error messages
 */
export const ERRORS = {
  INVALID_ADDRESS: "Invalid Ethereum address format",
  INVALID_PRIVATE_KEY: "Invalid private key format",
  FACTORY_NOT_DEPLOYED: "Factory contract not deployed on this network",
  INSUFFICIENT_BALANCE: "Insufficient balance for transaction",
  TRANSACTION_FAILED: "Transaction failed",
  CONTRACT_PAUSED: "Contract is paused",
  NOT_OWNER: "Caller is not the owner",
  TOKEN_NOT_FOUND: "Token does not exist",
  MAX_SUPPLY_REACHED: "Maximum supply reached",
  INVALID_ROYALTY: "Royalty percentage must be between 0 and 100",
  TICKET_ALREADY_CLOSED: "Ticket is already closed",
  TICKET_NOT_FOR_SALE: "Ticket is not for sale",
} as const;

/**
 * Event names emitted by contracts
 */
export const CONTRACT_EVENTS = {
  factory: {
    FuturaEventCreated: "FuturaEventCreated",
  },
  event: {
    TokenMinted: "TokenMinted",
    TokenPriced: "TokenPriced",
    TokenStatusChanged: "TokenStatusChanged",
    ResaleCancelled: "ResaleCancelled",
    MaxSupplyReached: "MaxSupplyReached",
    Transfer: "Transfer",
    Paused: "Paused",
    Unpaused: "Unpaused",
  },
} as const;

/**
 * Default metadata base URI
 */
export const DEFAULT_BASE_URI = "https://api.futuratickets.com/metadata/";

/**
 * Export all
 */
export default {
  NETWORKS,
  CONTRACT_ADDRESSES,
  GAS_LIMITS,
  DEFAULT_ROYALTY_PERCENTAGE,
  MAX_ROYALTY_PERCENTAGE,
  TicketStatus,
  TICKET_STATUS_NAMES,
  DEFAULT_MAX_SUPPLY,
  GAS_PRICE_SETTINGS,
  CONFIRMATION_BLOCKS,
  ERRORS,
  CONTRACT_EVENTS,
  DEFAULT_BASE_URI,
  getNetworkByChainId,
  getFactoryAddress,
  isValidAddress,
  isValidPrivateKey,
};
