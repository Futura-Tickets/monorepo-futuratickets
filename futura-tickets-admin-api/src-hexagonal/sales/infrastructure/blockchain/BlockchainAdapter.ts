import { Injectable } from '@nestjs/common';
import { encodeFunctionData } from 'viem';
import { IBlockchainService } from '../../domain/services/IBlockchainService';
import { AbstractionService } from 'src/Abstraction/abstraction.service';
import { ProviderService } from 'src/Provider/provider.service';
import * as EventAbi from 'src/abis/Event.json';

/**
 * BlockchainAdapter - Adapter
 *
 * Implementación concreta del puerto IBlockchainService
 * Infrastructure Layer - Detalles de blockchain (ethers, viem)
 *
 * Hexagonal Architecture: Adapter que implementa un Port
 */
@Injectable()
export class BlockchainAdapter implements IBlockchainService {
  constructor(
    private readonly abstractionService: AbstractionService,
    private readonly providerService: ProviderService,
  ) {}

  async setNFTPrice(
    accountPrivateKey: string,
    eventAddress: string,
    tokenId: number,
    price: number,
  ): Promise<string> {
    console.log('[BlockchainAdapter] Setting NFT price...');

    const smartAccountClient =
      await this.abstractionService.getSmartAccountClient(
        accountPrivateKey as `0x${string}`,
      );

    const callData = encodeFunctionData({
      abi: EventAbi.abi,
      functionName: 'setNFTPrice',
      args: [tokenId, price],
    });

    const txHash = await this.abstractionService.sendTransaction(
      smartAccountClient,
      eventAddress as `0x${string}`,
      callData,
    );

    console.log('[BlockchainAdapter] NFT price set, waiting for confirmation...');
    const provider = this.providerService.getProvider();
    const receipt = await provider.waitForTransaction(txHash, 1);

    console.log('[BlockchainAdapter] Transaction confirmed!');
    return receipt!.hash;
  }

  async cancelNFTResale(
    accountPrivateKey: string,
    eventAddress: string,
    tokenId: number,
  ): Promise<string> {
    console.log('[BlockchainAdapter] Cancelling NFT resale...');

    const smartAccountClient =
      await this.abstractionService.getSmartAccountClient(
        accountPrivateKey as `0x${string}`,
      );

    const callData = encodeFunctionData({
      abi: EventAbi.abi,
      functionName: 'cancelResale',
      args: [tokenId],
    });

    const txHash = await this.abstractionService.sendTransaction(
      smartAccountClient,
      eventAddress as `0x${string}`,
      callData,
    );

    console.log('[BlockchainAdapter] Resale cancelled, waiting for confirmation...');
    const provider = this.providerService.getProvider();
    const receipt = await provider.waitForTransaction(txHash, 1);

    console.log('[BlockchainAdapter] Transaction confirmed!');
    return receipt!.hash;
  }

  async transferNFT(
    accountPrivateKey: string,
    eventAddress: string,
    tokenId: number,
    toAddress: string,
  ): Promise<string> {
    console.log('[BlockchainAdapter] Transferring NFT...');

    const smartAccountClient =
      await this.abstractionService.getSmartAccountClient(
        accountPrivateKey as `0x${string}`,
      );

    const callData = encodeFunctionData({
      abi: EventAbi.abi,
      functionName: 'transferFrom',
      args: [smartAccountClient.account.address, toAddress, tokenId],
    });

    const txHash = await this.abstractionService.sendTransaction(
      smartAccountClient,
      eventAddress as `0x${string}`,
      callData,
    );

    console.log('[BlockchainAdapter] NFT transferred, waiting for confirmation...');
    const provider = this.providerService.getProvider();
    const receipt = await provider.waitForTransaction(txHash, 1);

    console.log('[BlockchainAdapter] Transaction confirmed!');
    return receipt!.hash;
  }
}
