import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http, parseAbiItem, Log } from 'viem';
import { baseSepolia } from 'viem/chains';
import { Event, EventDocument } from '../Event/event.schema';
import { Orders, OrdersDocument } from '../Orders/orders.schema';

/**
 * Blockchain Event Listener Service
 * Listens to smart contract events and synchronizes with MongoDB
 */
@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private publicClient: any;
  private factoryAddress: `0x${string}`;
  private isListening = false;
  private watchHandlers: any[] = [];

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Orders.name) private orderModel: Model<OrdersDocument>,
    private configService: ConfigService,
  ) {
    const factoryAddr = this.configService.get<string>(
      'FACTORY_CONTRACT_ADDRESS',
    );
    if (!factoryAddr) {
      console.warn('⚠️  FACTORY_CONTRACT_ADDRESS not configured');
    }
    this.factoryAddress = factoryAddr as `0x${string}`;
  }

  /**
   * Initialize event listeners when module starts
   */
  async onModuleInit() {
    try {
      // Check if blockchain is enabled
      const blockchainEnabled = this.configService.get<string>(
        'BLOCKCHAIN_ENABLED',
      );
      if (blockchainEnabled !== 'true') {
        console.log('ℹ️  Blockchain event listeners disabled');
        return;
      }

      if (!this.factoryAddress) {
        console.warn(
          '⚠️  Cannot start blockchain listeners: Factory address not configured',
        );
        return;
      }

      // Initialize public client
      const alchemyApiKey =
        this.configService.get<string>('ALCHEMY_API_KEY');
      if (!alchemyApiKey) {
        throw new Error('ALCHEMY_API_KEY not configured');
      }

      this.publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(
          `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
        ),
      });

      console.log('🔗 Starting blockchain event listeners...');
      await this.startListeners();
      this.isListening = true;
      console.log('✅ Blockchain event listeners active');
    } catch (error) {
      console.error('❌ Failed to start blockchain listeners:', error);
    }
  }

  /**
   * Cleanup when module is destroyed
   */
  async onModuleDestroy() {
    await this.stopListeners();
  }

  /**
   * Start listening to blockchain events
   */
  private async startListeners() {
    // Listen to Factory events: FuturaEventCreated
    const factoryWatcher = this.publicClient.watchEvent({
      address: this.factoryAddress,
      event: parseAbiItem(
        'event FuturaEventCreated(uint256 indexed eventId, address indexed contractAddress, address indexed owner, string eventName, uint256 maxSupply)',
      ),
      onLogs: (logs: Log[]) => this.handleFuturaEventCreated(logs),
      pollingInterval: 5000, // Poll every 5 seconds
    });

    this.watchHandlers.push(factoryWatcher);

    // Listen to TokenMinted events from all Event contracts
    // We'll track all known event contracts from our database
    await this.listenToExistingEvents();
  }

  /**
   * Stop all event listeners
   */
  private async stopListeners() {
    if (this.isListening) {
      console.log('🛑 Stopping blockchain event listeners...');
      for (const handler of this.watchHandlers) {
        if (handler && typeof handler === 'function') {
          handler(); // Unwatch function
        }
      }
      this.watchHandlers = [];
      this.isListening = false;
      console.log('✅ Blockchain event listeners stopped');
    }
  }

  /**
   * Start listening to TokenMinted events from existing Event contracts
   */
  private async listenToExistingEvents() {
    try {
      // Get all events that have a blockchain address
      const events = await this.eventModel
        .find({ address: { $exists: true, $ne: null } })
        .exec();

      console.log(
        `📡 Setting up listeners for ${events.length} existing event contracts`,
      );

      for (const event of events) {
        if (event.address) {
          await this.listenToEventContract(event.address);
        }
      }
    } catch (error) {
      console.error('Error setting up existing event listeners:', error);
    }
  }

  /**
   * Listen to events from a specific Event contract
   */
  private async listenToEventContract(contractAddress: string) {
    try {
      const watcher = this.publicClient.watchEvent({
        address: contractAddress as `0x${string}`,
        event: parseAbiItem(
          'event TokenMinted(address indexed client, uint256 indexed timeStamp, uint256 indexed tokenId)',
        ),
        onLogs: (logs: Log[]) =>
          this.handleTokenMinted(logs, contractAddress),
        pollingInterval: 5000,
      });

      this.watchHandlers.push(watcher);
      console.log(`✅ Listening to TokenMinted events from ${contractAddress}`);
    } catch (error) {
      console.error(
        `Failed to set up listener for ${contractAddress}:`,
        error,
      );
    }
  }

  /**
   * Handle FuturaEventCreated events
   * Updates Event document with blockchain address
   */
  private async handleFuturaEventCreated(logs: Log[]) {
    for (const log of logs) {
      try {
        const { eventId, contractAddress, owner, eventName, maxSupply } =
          log.args as {
            eventId: bigint;
            contractAddress: string;
            owner: string;
            eventName: string;
            maxSupply: bigint;
          };

        console.log(
          `📝 FuturaEventCreated: ID=${eventId}, Address=${contractAddress}`,
        );

        // Find event in database (match by name and promoter)
        // This assumes the event was created in DB before blockchain deployment
        const event = await this.eventModel
          .findOne({
            name: eventName,
            promoter: owner.toLowerCase(),
            address: { $exists: false }, // Not yet linked to blockchain
          })
          .exec();

        if (event) {
          // Update event with blockchain address
          event.address = contractAddress;
          event.maxSupply = Number(maxSupply);
          event.blockNumber = Number(log.blockNumber);
          await event.save();

          console.log(
            `✅ Updated event ${event._id} with blockchain address ${contractAddress}`,
          );

          // Start listening to this new contract
          await this.listenToEventContract(contractAddress);
        } else {
          console.warn(
            `⚠️  Event not found in database for contract ${contractAddress}`,
          );
          // Could create a new event here if needed
        }
      } catch (error) {
        console.error('Error handling FuturaEventCreated:', error);
      }
    }
  }

  /**
   * Handle TokenMinted events
   * Creates or updates Order document with blockchain transaction data
   */
  private async handleTokenMinted(logs: Log[], contractAddress: string) {
    for (const log of logs) {
      try {
        const { client, timeStamp, tokenId } = log.args as {
          client: string;
          timeStamp: bigint;
          tokenId: bigint;
        };

        console.log(
          `🎫 TokenMinted: Contract=${contractAddress}, TokenId=${tokenId}, Client=${client}`,
        );

        // Find the event by contract address
        const event = await this.eventModel
          .findOne({ address: contractAddress })
          .exec();

        if (!event) {
          console.warn(
            `⚠️  Event not found for contract ${contractAddress}`,
          );
          continue;
        }

        // Find or create order
        // Match by event, timestamp, and client address
        let order = await this.orderModel
          .findOne({
            event: event._id,
            'blockchain.expectedTimestamp': Number(timeStamp),
          })
          .exec();

        if (order) {
          // Update existing order with blockchain confirmation
          order.blockchain = {
            tokenId: Number(tokenId),
            contractAddress: contractAddress,
            transactionHash: log.transactionHash as string,
            blockNumber: Number(log.blockNumber),
            confirmed: true,
            expectedTimestamp: Number(timeStamp),
          };
          order.status = 'confirmed'; // Update order status
          await order.save();

          console.log(
            `✅ Updated order ${order._id} with tokenId ${tokenId}`,
          );
        } else {
          console.warn(
            `⚠️  Order not found for event ${event._id} at timestamp ${timeStamp}`,
          );
          // Could create a new order here if blockchain mint happened outside normal flow
        }
      } catch (error) {
        console.error('Error handling TokenMinted:', error);
      }
    }
  }

  /**
   * Manually trigger sync for a specific block range
   * Useful for catching up on missed events
   */
  async syncEventRange(fromBlock: bigint, toBlock: bigint) {
    try {
      console.log(`🔄 Syncing events from block ${fromBlock} to ${toBlock}`);

      // Sync Factory events
      const factoryLogs = await this.publicClient.getLogs({
        address: this.factoryAddress,
        event: parseAbiItem(
          'event FuturaEventCreated(uint256 indexed eventId, address indexed contractAddress, address indexed owner, string eventName, uint256 maxSupply)',
        ),
        fromBlock,
        toBlock,
      });

      await this.handleFuturaEventCreated(factoryLogs);

      // Sync TokenMinted events for all known contracts
      const events = await this.eventModel
        .find({ address: { $exists: true, $ne: null } })
        .exec();

      for (const event of events) {
        if (event.address) {
          const tokenLogs = await this.publicClient.getLogs({
            address: event.address as `0x${string}`,
            event: parseAbiItem(
              'event TokenMinted(address indexed client, uint256 indexed timeStamp, uint256 indexed tokenId)',
            ),
            fromBlock,
            toBlock,
          });

          await this.handleTokenMinted(tokenLogs, event.address);
        }
      }

      console.log('✅ Event sync completed');
    } catch (error) {
      console.error('Error syncing events:', error);
      throw error;
    }
  }

  /**
   * Get current listening status
   */
  getStatus(): {
    isListening: boolean;
    factoryAddress: string;
    activeWatchers: number;
  } {
    return {
      isListening: this.isListening,
      factoryAddress: this.factoryAddress,
      activeWatchers: this.watchHandlers.length,
    };
  }
}
