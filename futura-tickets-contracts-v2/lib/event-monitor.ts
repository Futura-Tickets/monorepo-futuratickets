/**
 * 🎧 Blockchain Event Monitor
 *
 * Sistema de monitoreo y escucha de eventos blockchain para integración con backends.
 * Permite suscribirse a eventos de contratos y recibir notificaciones en tiempo real.
 *
 * Features:
 * - ✅ Event listening con auto-reconexión
 * - ✅ Histórico de eventos (desde bloque específico)
 * - ✅ Filtrado por eventos específicos
 * - ✅ Handlers personalizables
 * - ✅ Error handling robusto
 * - ✅ TypeScript types completos
 *
 * Usage:
 * ```typescript
 * import { EventMonitor } from './lib/event-monitor';
 *
 * const monitor = new EventMonitor({
 *   rpcUrl: NETWORKS.hardhat.rpcUrl,
 *   factoryAddress: CONTRACT_ADDRESSES.hardhat.factoryAddress
 * });
 *
 * // Escuchar eventos del Factory
 * monitor.onFactoryEventCreated((event) => {
 *   console.log('Nuevo evento creado:', event.eventAddress);
 *   // Guardar en BD
 * });
 *
 * // Escuchar eventos de un contrato específico
 * monitor.onTokenMinted(eventContractAddress, (event) => {
 *   console.log('Ticket minteado:', event.tokenId);
 *   // Actualizar BD
 * });
 * ```
 */

import { ethers } from "ethers";
import FuturaEventFactoryABI from "../abi/FuturaEventFactory.json";
import FuturaEventABI from "../abi/FuturaEvent.json";

// ==================== TYPES ====================

export interface EventMonitorConfig {
  rpcUrl: string;
  factoryAddress: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  pollingInterval?: number;
}

export interface FactoryEventCreatedEvent {
  eventAddress: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

export interface TokenMintedEvent {
  client: string;
  tokenId: number;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

export interface TokenPricedEvent {
  tokenId: number;
  price: string; // En Wei (usar ethers.formatEther para convertir)
  blockNumber: number;
  transactionHash: string;
}

export interface TokenStatusChangedEvent {
  tokenId: number;
  status: number; // 0=OPEN, 1=CLOSED, 2=SALE
  blockNumber: number;
  transactionHash: string;
}

export interface TokenCancelEvent {
  tokenId: number;
  blockNumber: number;
  transactionHash: string;
}

export interface TransferEvent {
  from: string;
  to: string;
  tokenId: number;
  blockNumber: number;
  transactionHash: string;
}

export type EventHandler<T> = (event: T) => void | Promise<void>;

// ==================== EVENT MONITOR CLASS ====================

export class EventMonitor {
  private provider: ethers.JsonRpcProvider;
  private factoryContract: ethers.Contract;
  private eventContracts: Map<string, ethers.Contract> = new Map();
  private config: Required<EventMonitorConfig>;
  private isConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: EventMonitorConfig) {
    this.config = {
      reconnectAttempts: config.reconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 5000,
      pollingInterval: config.pollingInterval ?? 4000,
      ...config,
    };

    this.provider = new ethers.JsonRpcProvider(
      this.config.rpcUrl,
      undefined,
      {
        polling: true,
        pollingInterval: this.config.pollingInterval,
      }
    );

    this.factoryContract = new ethers.Contract(
      this.config.factoryAddress,
      FuturaEventFactoryABI,
      this.provider
    );

    this.setupConnectionMonitoring();
  }

  // ==================== CONNECTION MANAGEMENT ====================

  private setupConnectionMonitoring(): void {
    this.provider.on("network", () => {
      this.isConnected = true;
      console.log("✅ [EventMonitor] Connected to network");
    });

    this.provider.on("error", (error) => {
      console.error("❌ [EventMonitor] Provider error:", error);
      this.isConnected = false;
      this.attemptReconnect();
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectTimer) return;

    let attempts = 0;
    const reconnect = async () => {
      attempts++;
      console.log(
        `🔄 [EventMonitor] Reconnect attempt ${attempts}/${this.config.reconnectAttempts}`
      );

      try {
        await this.provider.getBlockNumber();
        this.isConnected = true;
        console.log("✅ [EventMonitor] Reconnected successfully");
        this.reconnectTimer = null;
      } catch (error) {
        if (attempts < this.config.reconnectAttempts) {
          this.reconnectTimer = setTimeout(reconnect, this.config.reconnectDelay);
        } else {
          console.error(
            "❌ [EventMonitor] Max reconnect attempts reached. Manual intervention required."
          );
          this.reconnectTimer = null;
        }
      }
    };

    reconnect();
  }

  public isMonitorConnected(): boolean {
    return this.isConnected;
  }

  public async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  // ==================== FACTORY EVENTS ====================

  /**
   * Escucha el evento FuturaEventCreated del Factory
   * Se emite cuando se crea un nuevo contrato de evento
   */
  public onFactoryEventCreated(
    handler: EventHandler<FactoryEventCreatedEvent>
  ): void {
    this.factoryContract.on(
      "FuturaEventCreated",
      async (eventId: bigint, contractAddress: string, event: ethers.Log) => {
        try {
          const block = await this.provider.getBlock(event.blockNumber);
          const processedEvent: FactoryEventCreatedEvent = {
            eventAddress: contractAddress,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: block?.timestamp ?? Date.now(),
          };

          await handler(processedEvent);
        } catch (error) {
          console.error(
            "[EventMonitor] Error processing FuturaEventCreated:",
            error
          );
        }
      }
    );

    console.log("👂 [EventMonitor] Listening to FuturaEventCreated events");
  }

  /**
   * Obtiene histórico de eventos FuturaEventCreated desde un bloque específico
   */
  public async getFactoryEventsHistory(
    fromBlock: number = 0
  ): Promise<FactoryEventCreatedEvent[]> {
    const filter = this.factoryContract.filters.FuturaEventCreated();
    const events = await this.factoryContract.queryFilter(
      filter,
      fromBlock,
      "latest"
    );

    const processedEvents: FactoryEventCreatedEvent[] = [];

    for (const event of events) {
      const block = await this.provider.getBlock(event.blockNumber);
      const args = event.args;

      if (args) {
        processedEvents.push({
          eventAddress: args.contractAddress,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: block?.timestamp ?? Date.now(),
        });
      }
    }

    return processedEvents;
  }

  // ==================== EVENT CONTRACT EVENTS ====================

  /**
   * Obtiene o crea una instancia del contrato de evento
   */
  private getEventContract(contractAddress: string): ethers.Contract {
    if (!this.eventContracts.has(contractAddress)) {
      const contract = new ethers.Contract(
        contractAddress,
        FuturaEventABI,
        this.provider
      );
      this.eventContracts.set(contractAddress, contract);
    }

    return this.eventContracts.get(contractAddress)!;
  }

  /**
   * Escucha el evento TokenMinted de un contrato de evento
   * Se emite cuando se mintea un nuevo ticket NFT
   */
  public onTokenMinted(
    contractAddress: string,
    handler: EventHandler<TokenMintedEvent>
  ): void {
    const contract = this.getEventContract(contractAddress);

    contract.on(
      "TokenMinted",
      async (
        client: string,
        timestamp: bigint,
        tokenId: bigint,
        event: ethers.Log
      ) => {
        try {
          const processedEvent: TokenMintedEvent = {
            client,
            tokenId: Number(tokenId),
            timestamp: Number(timestamp),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          };

          await handler(processedEvent);
        } catch (error) {
          console.error("[EventMonitor] Error processing TokenMinted:", error);
        }
      }
    );

    console.log(
      `👂 [EventMonitor] Listening to TokenMinted events on ${contractAddress.slice(0, 10)}...`
    );
  }

  /**
   * Escucha el evento TokenPriced
   * Se emite cuando se establece un precio de reventa
   */
  public onTokenPriced(
    contractAddress: string,
    handler: EventHandler<TokenPricedEvent>
  ): void {
    const contract = this.getEventContract(contractAddress);

    contract.on(
      "TokenPriced",
      async (tokenId: bigint, price: bigint, event: ethers.Log) => {
        try {
          const processedEvent: TokenPricedEvent = {
            tokenId: Number(tokenId),
            price: price.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          };

          await handler(processedEvent);
        } catch (error) {
          console.error("[EventMonitor] Error processing TokenPriced:", error);
        }
      }
    );

    console.log(
      `👂 [EventMonitor] Listening to TokenPriced events on ${contractAddress.slice(0, 10)}...`
    );
  }

  /**
   * Escucha el evento TokenCancel
   * Se emite cuando se cancela una reventa
   */
  public onTokenCancel(
    contractAddress: string,
    handler: EventHandler<TokenCancelEvent>
  ): void {
    const contract = this.getEventContract(contractAddress);

    contract.on("TokenCancel", async (tokenId: bigint, event: ethers.Log) => {
      try {
        const processedEvent: TokenCancelEvent = {
          tokenId: Number(tokenId),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        };

        await handler(processedEvent);
      } catch (error) {
        console.error("[EventMonitor] Error processing TokenCancel:", error);
      }
    });

    console.log(
      `👂 [EventMonitor] Listening to TokenCancel events on ${contractAddress.slice(0, 10)}...`
    );
  }

  /**
   * Escucha el evento Transfer (ERC-721 estándar)
   * Se emite en todas las transferencias de NFTs
   */
  public onTransfer(
    contractAddress: string,
    handler: EventHandler<TransferEvent>
  ): void {
    const contract = this.getEventContract(contractAddress);

    contract.on(
      "Transfer",
      async (from: string, to: string, tokenId: bigint, event: ethers.Log) => {
        try {
          const processedEvent: TransferEvent = {
            from,
            to,
            tokenId: Number(tokenId),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          };

          await handler(processedEvent);
        } catch (error) {
          console.error("[EventMonitor] Error processing Transfer:", error);
        }
      }
    );

    console.log(
      `👂 [EventMonitor] Listening to Transfer events on ${contractAddress.slice(0, 10)}...`
    );
  }

  /**
   * Escucha múltiples eventos de un contrato
   */
  public onAllEvents(
    contractAddress: string,
    handlers: {
      onMinted?: EventHandler<TokenMintedEvent>;
      onPriced?: EventHandler<TokenPricedEvent>;
      onCancel?: EventHandler<TokenCancelEvent>;
      onTransfer?: EventHandler<TransferEvent>;
    }
  ): void {
    if (handlers.onMinted) {
      this.onTokenMinted(contractAddress, handlers.onMinted);
    }
    if (handlers.onPriced) {
      this.onTokenPriced(contractAddress, handlers.onPriced);
    }
    if (handlers.onCancel) {
      this.onTokenCancel(contractAddress, handlers.onCancel);
    }
    if (handlers.onTransfer) {
      this.onTransfer(contractAddress, handlers.onTransfer);
    }

    console.log(
      `👂 [EventMonitor] Listening to all events on ${contractAddress.slice(0, 10)}...`
    );
  }

  // ==================== HISTORICAL QUERIES ====================

  /**
   * Obtiene histórico de eventos TokenMinted
   */
  public async getTokenMintedHistory(
    contractAddress: string,
    fromBlock: number = 0
  ): Promise<TokenMintedEvent[]> {
    const contract = this.getEventContract(contractAddress);
    const filter = contract.filters.TokenMinted();
    const events = await contract.queryFilter(filter, fromBlock, "latest");

    return events.map((event) => {
      const args = event.args;
      return {
        client: args!.client,
        tokenId: Number(args!.tokenId),
        timestamp: Number(args!.timeStamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      };
    });
  }

  /**
   * Obtiene histórico de eventos Transfer
   */
  public async getTransferHistory(
    contractAddress: string,
    fromBlock: number = 0
  ): Promise<TransferEvent[]> {
    const contract = this.getEventContract(contractAddress);
    const filter = contract.filters.Transfer();
    const events = await contract.queryFilter(filter, fromBlock, "latest");

    return events.map((event) => {
      const args = event.args;
      return {
        from: args!.from,
        to: args!.to,
        tokenId: Number(args!.tokenId),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      };
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Registra dinámicamente contratos de eventos creados por el Factory
   * Útil para empezar a escuchar eventos de nuevos contratos automáticamente
   */
  public async autoRegisterNewEvents(
    onNewEvent: (eventAddress: string) => void
  ): Promise<void> {
    this.onFactoryEventCreated(async (factoryEvent) => {
      console.log(
        `🆕 [EventMonitor] New event contract detected: ${factoryEvent.eventAddress}`
      );

      // Callback para que el backend registre el contrato
      onNewEvent(factoryEvent.eventAddress);

      // Auto-registrar listeners básicos si es necesario
      // this.onAllEvents(factoryEvent.eventAddress, {...});
    });

    console.log("🤖 [EventMonitor] Auto-registration enabled for new events");
  }

  /**
   * Detiene todos los listeners
   */
  public stopAllListeners(): void {
    this.factoryContract.removeAllListeners();
    this.eventContracts.forEach((contract) => {
      contract.removeAllListeners();
    });

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    console.log("🛑 [EventMonitor] All listeners stopped");
  }

  /**
   * Obtiene información del estado del monitor
   */
  public getStatus(): {
    connected: boolean;
    factoryAddress: string;
    trackedContracts: number;
    rpcUrl: string;
  } {
    return {
      connected: this.isConnected,
      factoryAddress: this.config.factoryAddress,
      trackedContracts: this.eventContracts.size,
      rpcUrl: this.config.rpcUrl,
    };
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Formatea el precio de Wei a Ether
 */
export function formatPrice(priceInWei: string): string {
  return ethers.formatEther(priceInWei);
}

/**
 * Convierte timestamp Unix a Date
 */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Formatea una dirección Ethereum (muestra primeros y últimos 6 caracteres)
 */
export function formatAddress(address: string): string {
  if (address.length !== 42) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ==================== EXPORTS ====================

export default EventMonitor;
