import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createSmartAccountClient,
  SmartAccountClient,
} from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import {
  createPimlicoClient,
} from 'permissionless/clients/pimlico';
import { createPublicClient, createWalletClient, http, Hash } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { entryPoint07Address } from 'viem/account-abstraction';
import { baseSepolia } from 'viem/chains';
import { ProviderService } from '../Provider/provider.service';

/**
 * Abstraction Service for Account Abstraction (ERC-4337)
 * Manages Smart Accounts, Bundlers, and Paymasters
 */
@Injectable()
export class AbstractionService {
  private readonly chain = baseSepolia;
  private readonly entryPoint = entryPoint07Address;

  constructor(
    private configService: ConfigService,
    private providerService: ProviderService,
  ) {}

  /**
   * Create a Smart Account Client for a given private key
   * Uses Pimlico as the bundler and paymaster service
   *
   * @param privateKey Private key in hex format (0x...)
   * @returns SmartAccountClient instance
   */
  async getSmartAccountClient(
    privateKey: `0x${string}`,
  ): Promise<SmartAccountClient> {
    try {
      console.log('Creating Smart Account Client...');

      // Get API keys from config
      const pimlicoApiKey = this.configService.get<string>('PIMLICO_API_KEY');
      if (!pimlicoApiKey) {
        throw new Error('PIMLICO_API_KEY not configured');
      }

      // Create signer from private key
      const signer = privateKeyToAccount(privateKey);

      // Get RPC URL from env or use default
      const rpcUrl = this.configService.get<string>('RPC_URL') || 'https://sepolia.base.org';

      // Create public client
      const publicClient = createPublicClient({
        transport: http(rpcUrl),
        chain: this.chain,
      });

      // Create Pimlico client (bundler + paymaster)
      const pimlicoClient = createPimlicoClient({
        transport: http(
          `https://api.pimlico.io/v2/${this.chain.id}/rpc?apikey=${pimlicoApiKey}`,
        ),
        entryPoint: {
          address: this.entryPoint,
          version: '0.7',
        },
      });

      // Create Simple Smart Account
      const simpleAccount = await toSimpleSmartAccount({
        client: publicClient,
        owner: signer,
        entryPoint: {
          address: this.entryPoint,
          version: '0.7',
        },
      });

      console.log('Smart Account Address:', simpleAccount.address);

      // Create Smart Account Client
      const smartAccountClient = createSmartAccountClient({
        account: simpleAccount,
        chain: this.chain,
        bundlerTransport: http(
          `https://api.pimlico.io/v2/${this.chain.id}/rpc?apikey=${pimlicoApiKey}`,
        ),
        paymaster: pimlicoClient,
        userOperation: {
          estimateFeesPerGas: async () => {
            return await pimlicoClient.getUserOperationGasPrice();
          },
        },
      });

      console.log('Smart Account Client created successfully');
      return smartAccountClient;
    } catch (error) {
      console.error('Error creating Smart Account Client:', error);
      throw new Error(`Failed to create Smart Account: ${(error as Error).message}`);
    }
  }

  /**
   * Send a transaction using Smart Account
   *
   * @param smartAccountClient Smart Account Client instance
   * @param to Destination contract address
   * @param callData Encoded function call data
   * @returns Transaction hash
   */
  async sendTransaction(
    smartAccountClient: SmartAccountClient,
    to: `0x${string}`,
    callData: `0x${string}`,
  ): Promise<Hash> {
    try {
      console.log('Sending transaction via Smart Account...');
      console.log('  To:', to);
      console.log('  CallData:', callData.slice(0, 66) + '...');

      const txHash = await smartAccountClient.sendTransaction({
        to,
        data: callData,
        value: 0n,
      });

      console.log('Transaction sent! Hash:', txHash);
      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw new Error(`Transaction failed: ${(error as Error).message}`);
    }
  }

  /**
   * Alternative: Send transaction using a regular EOA (no Account Abstraction)
   * Use this as fallback or for simpler operations
   *
   * @param privateKey Private key of EOA
   * @param to Destination address
   * @param callData Encoded function call data
   * @returns Transaction hash
   */
  async sendTransactionEOA(
    privateKey: `0x${string}`,
    to: `0x${string}`,
    callData: `0x${string}`,
  ): Promise<Hash> {
    try {
      console.log('Sending transaction via EOA...');

      const signer = privateKeyToAccount(privateKey);

      const rpcUrl = this.configService.get<string>('RPC_URL') || 'https://sepolia.base.org';

      const walletClient = createWalletClient({
        account: signer,
        transport: http(rpcUrl),
        chain: this.chain,
      });

      const hash = await walletClient.sendTransaction({
        to,
        data: callData,
        value: 0n,
      });

      console.log('EOA Transaction sent! Hash:', hash);
      return hash;
    } catch (error) {
      console.error('Error sending EOA transaction:', error);
      throw new Error(`EOA Transaction failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get Smart Account address for a given private key without creating the full client
   * Useful for checking if account exists or getting address for UI
   *
   * @param privateKey Private key in hex format
   * @returns Smart Account address
   */
  async getSmartAccountAddress(
    privateKey: `0x${string}`,
  ): Promise<`0x${string}`> {
    try {
      const signer = privateKeyToAccount(privateKey);
      const rpcUrl = this.configService.get<string>('RPC_URL') || 'https://sepolia.base.org';

      const publicClient = createPublicClient({
        transport: http(rpcUrl),
        chain: this.chain,
      });

      const simpleAccount = await toSimpleSmartAccount({
        client: publicClient,
        owner: signer,
        entryPoint: {
          address: this.entryPoint,
          version: '0.7',
        },
      });

      return simpleAccount.address;
    } catch (error) {
      console.error('Error getting Smart Account address:', error);
      throw new Error(`Failed to get address: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a Smart Account has been deployed
   *
   * @param address Smart Account address
   * @returns True if deployed, false otherwise
   */
  async isSmartAccountDeployed(address: `0x${string}`): Promise<boolean> {
    try {
      const rpcUrl = this.configService.get<string>('RPC_URL') || 'https://sepolia.base.org';

      const publicClient = createPublicClient({
        transport: http(rpcUrl),
        chain: this.chain,
      });

      const code = await publicClient.getBytecode({ address });
      return code !== undefined && code !== '0x';
    } catch (error) {
      console.error('Error checking Smart Account deployment:', error);
      return false;
    }
  }
}
