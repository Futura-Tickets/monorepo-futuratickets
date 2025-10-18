import { Injectable, Logger } from '@nestjs/common';
import { ProviderService } from '../Provider/provider.service';
import { ConfigService } from '@nestjs/config';
import { Wallet } from 'ethers';

// Renamed from SmartAccountClient to avoid conflict with permissionless library
export interface FuturaAccountClient {
  account: { address: `0x${string}` };
  wallet: Wallet;
}

@Injectable()
export class AbstractionService {
  private readonly logger = new Logger(AbstractionService.name);
  private readonly gasLimit: bigint;

  constructor(
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService,
  ) {
    const configuredLimit = this.configService.get<string>('BLOCKCHAIN_DEFAULT_GAS_LIMIT');
    this.gasLimit = configuredLimit ? BigInt(configuredLimit) : 600000n;
  }

  public async getSmartAccountClient(privateKey: `0x${string}`): Promise<FuturaAccountClient> {
    this.ensureProviderConfigured();

    try {
      const provider = this.providerService.getProvider();
      const wallet = new Wallet(privateKey, provider);
      this.logger.debug(`Smart account client generated for ${wallet.address}`);
      return {
        wallet,
        account: { address: wallet.address as `0x${string}` },
      };
    } catch (error) {
      this.logger.error('Failed to create smart account client', error.stack);
      throw error;
    }
  }

  public async sendTransaction(
    smartAccountClient: FuturaAccountClient,
    to: `0x${string}`,
    data: `0x${string}`,
    overrides: { value?: bigint; gasLimit?: bigint } = {},
  ): Promise<`0x${string}`> {
    this.ensureProviderConfigured();

    if (!smartAccountClient?.wallet) {
      throw new Error('Invalid smart account client');
    }

    try {
      const txResponse = await smartAccountClient.wallet.sendTransaction({
        to,
        data,
        value: overrides.value ?? 0n,
        gasLimit: overrides.gasLimit ?? this.gasLimit,
      });

      this.logger.debug(`Transaction sent by ${smartAccountClient.wallet.address} -> ${to}`);
      return txResponse.hash as `0x${string}`;
    } catch (error) {
      this.logger.error('Failed to send blockchain transaction', error.stack);
      throw error;
    }
  }

  private ensureProviderConfigured(): void {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    if (!rpcUrl) {
      throw new Error('Blockchain provider is not configured. Set BLOCKCHAIN_RPC_URL in the environment variables.');
    }
  }
}
