/**
 * 🔗 FuturaTickets Blockchain Library
 *
 * Centralized exports for easy backend integration.
 *
 * Usage in your backend:
 *   import {
 *     BlockchainService,
 *     NETWORKS,
 *     CONTRACT_ADDRESSES,
 *     TicketStatus
 *   } from '../futura-tickets-contracts-v2/lib';
 *
 * Or import from ABIs:
 *   import { FuturaEventFactoryABI } from '../futura-tickets-contracts-v2/abi';
 */

// Main blockchain service
export { BlockchainService, default as Blockchain } from "./blockchain-helpers";
export type {
  BlockchainConfig,
  CreateEventParams,
  MintTicketParams,
  TicketDetails,
} from "./blockchain-helpers";

// Constants and configuration
export {
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
} from "./constants";

// Event monitoring system
export {
  EventMonitor,
  default as Monitor,
  formatPrice,
  timestampToDate,
  formatAddress,
} from "./event-monitor";
export type {
  EventMonitorConfig,
  FactoryEventCreatedEvent,
  TokenMintedEvent,
  TokenPricedEvent,
  TokenStatusChangedEvent,
  TokenCancelEvent,
  TransferEvent,
  EventHandler,
} from "./event-monitor";

// Re-export ABIs for convenience
export { default as FuturaEventFactoryABI } from "../abi/FuturaEventFactory.json";
export { default as FuturaEventABI } from "../abi/FuturaEvent.json";

/**
 * Quick start example:
 *
 * ```typescript
 * import { BlockchainService, NETWORKS, CONTRACT_ADDRESSES } from './lib';
 *
 * const blockchain = new BlockchainService({
 *   rpcUrl: NETWORKS.hardhat.rpcUrl,
 *   factoryAddress: CONTRACT_ADDRESSES.hardhat.factoryAddress,
 *   privateKey: process.env.DEPLOYER_PRIVATE_KEY_LOCAL!,
 * });
 *
 * // Create an event
 * const event = await blockchain.createEvent({
 *   promoterAddress: '0x...',
 *   eventName: 'My Event',
 *   maxSupply: 1000,
 *   baseURI: 'https://metadata.example.com/'
 * });
 *
 * // Mint a ticket
 * const ticket = await blockchain.mintTicket({
 *   eventContractAddress: event.contractAddress,
 *   clientAddress: '0x...',
 *   priceInEth: '0.05',
 *   royaltyPercentage: 5
 * });
 * ```
 */
