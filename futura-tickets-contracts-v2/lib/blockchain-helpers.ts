/**
 * 🔗 Blockchain Helpers for Backend Integration
 *
 * This file provides ready-to-use functions for interacting with
 * FuturaTickets smart contracts from your NestJS/Express backends.
 *
 * Usage:
 *   import { BlockchainService } from '../futura-tickets-contracts-v2/lib/blockchain-helpers';
 *
 *   const blockchain = new BlockchainService({
 *     rpcUrl: process.env.RPC_URL,
 *     factoryAddress: process.env.FACTORY_CONTRACT_ADDRESS,
 *     privateKey: process.env.DEPLOYER_PRIVATE_KEY
 *   });
 *
 *   const { eventId, contractAddress } = await blockchain.createEvent(...);
 */

import { ethers } from "ethers";
import FuturaEventFactoryABI from "../abi/FuturaEventFactory.json";
import FuturaEventABI from "../abi/FuturaEvent.json";

export interface BlockchainConfig {
  rpcUrl: string;
  factoryAddress: string;
  privateKey: string;
  gasLimit?: number;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface CreateEventParams {
  promoterAddress: string;
  eventName: string;
  maxSupply: number;
  baseURI: string;
}

export interface MintTicketParams {
  eventContractAddress: string;
  clientAddress: string;
  priceInEth: string;
  royaltyPercentage: number;
}

export interface TicketDetails {
  tokenId: number;
  owner: string;
  price: string;
  creator: string;
  royaltyPercentage: number;
  status: "OPEN" | "CLOSED" | "SALE";
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private factoryContract: ethers.Contract;
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.factoryContract = new ethers.Contract(
      config.factoryAddress,
      FuturaEventFactoryABI,
      this.wallet
    );
  }

  /**
   * Create a new event contract
   */
  async createEvent(params: CreateEventParams) {
    try {
      const tx = await this.factoryContract.createNew(
        params.promoterAddress,
        params.eventName,
        params.maxSupply,
        params.baseURI,
        this.getGasOptions()
      );

      const receipt = await tx.wait();

      // Parse event from logs
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.factoryContract.interface.parseLog(log);
          return parsed?.name === "FuturaEventCreated";
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error("Event creation failed - no event found in logs");
      }

      const parsedEvent = this.factoryContract.interface.parseLog(event);
      if (!parsedEvent) throw new Error("Failed to parse event");

      return {
        eventId: parsedEvent.args.eventId.toString(),
        contractAddress: parsedEvent.args.contractAddress,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  /**
   * Mint a ticket NFT
   */
  async mintTicket(params: MintTicketParams) {
    try {
      const eventContract = new ethers.Contract(
        params.eventContractAddress,
        FuturaEventABI,
        this.wallet
      );

      const priceWei = ethers.parseEther(params.priceInEth);
      const timestamp = Math.floor(Date.now() / 1000);

      const tx = await eventContract.mintNFT(
        priceWei,
        params.clientAddress,
        params.royaltyPercentage,
        timestamp,
        0, // TicketStatus.OPEN
        this.getGasOptions()
      );

      const receipt = await tx.wait();

      // Parse mint event
      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = eventContract.interface.parseLog(log);
          return parsed?.name === "TokenMinted";
        } catch {
          return false;
        }
      });

      if (!mintEvent) {
        throw new Error("Minting failed - no event found in logs");
      }

      const parsedMintEvent = eventContract.interface.parseLog(mintEvent);
      if (!parsedMintEvent) throw new Error("Failed to parse mint event");

      return {
        tokenId: parsedMintEvent.args.tokenId.toString(),
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      throw new Error(`Failed to mint ticket: ${error.message}`);
    }
  }

  /**
   * Get ticket details
   */
  async getTicketDetails(
    eventContractAddress: string,
    tokenId: number
  ): Promise<TicketDetails> {
    try {
      const eventContract = new ethers.Contract(
        eventContractAddress,
        FuturaEventABI,
        this.provider // Read-only
      );

      const details = await eventContract.getTicketDetails(tokenId);
      const owner = await eventContract.ownerOf(tokenId);

      const statuses = ["OPEN", "CLOSED", "SALE"] as const;

      return {
        tokenId,
        owner,
        price: ethers.formatEther(details.price),
        creator: details.creator,
        royaltyPercentage: Number(details.royaltyPercentage),
        status: statuses[details.status],
      };
    } catch (error: any) {
      throw new Error(`Failed to get ticket details: ${error.message}`);
    }
  }

  /**
   * Set ticket price for resale
   */
  async setTicketPrice(
    eventContractAddress: string,
    tokenId: number,
    priceInEth: string
  ) {
    try {
      const eventContract = new ethers.Contract(
        eventContractAddress,
        FuturaEventABI,
        this.wallet
      );

      const priceWei = ethers.parseEther(priceInEth);
      const tx = await eventContract.setNFTPrice(
        tokenId,
        priceWei,
        this.getGasOptions()
      );

      const receipt = await tx.wait();

      return {
        tokenId,
        price: priceInEth,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to set ticket price: ${error.message}`);
    }
  }

  /**
   * Cancel ticket resale
   */
  async cancelResale(eventContractAddress: string, tokenId: number) {
    try {
      const eventContract = new ethers.Contract(
        eventContractAddress,
        FuturaEventABI,
        this.wallet
      );

      const tx = await eventContract.cancelResale(tokenId, this.getGasOptions());
      const receipt = await tx.wait();

      return {
        tokenId,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to cancel resale: ${error.message}`);
    }
  }

  /**
   * Transfer ticket to another address
   */
  async transferTicket(
    eventContractAddress: string,
    tokenId: number,
    toAddress: string
  ) {
    try {
      const eventContract = new ethers.Contract(
        eventContractAddress,
        FuturaEventABI,
        this.wallet
      );

      const tx = await eventContract.transferNFT(
        tokenId,
        toAddress,
        this.getGasOptions()
      );

      const receipt = await tx.wait();

      return {
        tokenId,
        from: this.wallet.address,
        to: toAddress,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to transfer ticket: ${error.message}`);
    }
  }

  /**
   * Mark ticket as used (check-in)
   */
  async checkInTicket(eventContractAddress: string, tokenId: number) {
    try {
      const eventContract = new ethers.Contract(
        eventContractAddress,
        FuturaEventABI,
        this.wallet
      );

      const tx = await eventContract.setTicketStatus(
        1, // TicketStatus.CLOSED
        tokenId,
        this.getGasOptions()
      );

      const receipt = await tx.wait();

      return {
        tokenId,
        status: "CLOSED",
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to check-in ticket: ${error.message}`);
    }
  }

  /**
   * Pause contract (emergency)
   */
  async pauseContract(eventContractAddress: string) {
    try {
      const eventContract = new ethers.Contract(
        eventContractAddress,
        FuturaEventABI,
        this.wallet
      );

      const tx = await eventContract.pause(this.getGasOptions());
      const receipt = await tx.wait();

      return {
        contractAddress: eventContractAddress,
        paused: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      throw new Error(`Failed to pause contract: ${error.message}`);
    }
  }

  /**
   * Unpause contract
   */
  async unpauseContract(eventContractAddress: string) {
    try {
      const eventContract = new ethers.Contract(
        eventContractAddress,
        FuturaEventABI,
        this.wallet
      );

      const tx = await eventContract.unpause(this.getGasOptions());
      const receipt = await tx.wait();

      return {
        contractAddress: eventContractAddress,
        paused: false,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      throw new Error(`Failed to unpause contract: ${error.message}`);
    }
  }

  /**
   * Get gas options for transactions
   */
  private getGasOptions() {
    const options: any = {};

    if (this.config.gasLimit) {
      options.gasLimit = this.config.gasLimit;
    }

    if (this.config.maxFeePerGas) {
      options.maxFeePerGas = ethers.parseUnits(this.config.maxFeePerGas, "gwei");
    }

    if (this.config.maxPriorityFeePerGas) {
      options.maxPriorityFeePerGas = ethers.parseUnits(
        this.config.maxPriorityFeePerGas,
        "gwei"
      );
    }

    return options;
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string) {
    return await this.provider.getTransactionReceipt(txHash);
  }
}

// Export for direct usage
export default BlockchainService;
