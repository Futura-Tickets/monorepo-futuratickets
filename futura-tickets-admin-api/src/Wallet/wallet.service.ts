import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { Account, AccountDocument } from '../Account/account.schema';

/**
 * Wallet Management Service
 * Handles creation, encryption, and management of user wallets
 */
@Injectable()
export class WalletService {
  private encryptionKey: Buffer;

  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private configService: ConfigService,
  ) {
    const key = this.configService.get<string>('WALLET_ENCRYPTION_KEY');
    if (!key) {
      throw new Error('WALLET_ENCRYPTION_KEY not configured in .env');
    }

    // Validate key length (must be 32 bytes = 64 hex chars)
    if (key.length !== 64) {
      throw new Error('WALLET_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }

    this.encryptionKey = Buffer.from(key, 'hex');
    console.log('✅ WalletService initialized with encryption');
  }

  /**
   * Genera un nuevo wallet EOA
   */
  generateWallet(): {
    address: string;
    privateKey: string;
    mnemonic: string;
  } {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic!.phrase,
    };
  }

  /**
   * Encripta una private key usando AES-256-CBC
   */
  encryptPrivateKey(privateKey: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Return IV + encrypted data separated by ":"
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Error encrypting private key:', error);
      throw new Error('Failed to encrypt private key');
    }
  }

  /**
   * Desencripta una private key
   */
  decryptPrivateKey(encryptedKey: string): string {
    try {
      const parts = encryptedKey.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted key format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Error decrypting private key:', error);
      throw new Error('Failed to decrypt private key');
    }
  }

  /**
   * Obtiene o crea wallet para un usuario
   * @param userId User ID (MongoDB ObjectId as string)
   * @returns Wallet info con private key desencriptada
   */
  async getOrCreateUserWallet(userId: string): Promise<{
    address: string;
    privateKey: string; // Decrypted for use
    smartAddress?: string;
  }> {
    try {
      const account = await this.accountModel.findById(userId);
      if (!account) {
        throw new Error(`Account not found: ${userId}`);
      }

      // Si ya tiene wallet, desencriptar y retornar
      if (account.walletAddress && account.key) {
        console.log(`📝 Using existing wallet for user ${userId}: ${account.walletAddress}`);

        return {
          address: account.walletAddress,
          privateKey: this.decryptPrivateKey(account.key),
          smartAddress: account.smartAddress || undefined,
        };
      }

      // Crear nuevo wallet
      console.log(`🆕 Creating new wallet for user ${userId}...`);
      const wallet = this.generateWallet();

      // Guardar en DB encriptado
      account.walletAddress = wallet.address;
      account.key = this.encryptPrivateKey(wallet.privateKey);
      account.mnemonic = this.encryptPrivateKey(wallet.mnemonic);
      account.isBlockchainEnabled = true;
      await account.save();

      console.log(`✅ Created wallet for user ${userId}: ${wallet.address}`);

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
    } catch (error) {
      console.error('Error getting/creating user wallet:', error);
      throw error;
    }
  }

  /**
   * Actualiza el Smart Account address de un usuario
   */
  async updateSmartAddress(userId: string, smartAddress: string): Promise<void> {
    try {
      await this.accountModel.findByIdAndUpdate(userId, {
        smartAddress,
      });
      console.log(`✅ Updated smart address for user ${userId}: ${smartAddress}`);
    } catch (error) {
      console.error('Error updating smart address:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene wallet configurado
   */
  async hasWallet(userId: string): Promise<boolean> {
    try {
      const account = await this.accountModel.findById(userId);
      return !!(account?.walletAddress && account?.key);
    } catch (error) {
      console.error('Error checking wallet:', error);
      return false;
    }
  }

  /**
   * Obtiene información pública del wallet (sin private key)
   */
  async getWalletInfo(userId: string): Promise<{
    address?: string;
    smartAddress?: string;
    isBlockchainEnabled: boolean;
  }> {
    try {
      const account = await this.accountModel.findById(userId);
      if (!account) {
        throw new Error(`Account not found: ${userId}`);
      }

      return {
        address: account.walletAddress || undefined,
        smartAddress: account.smartAddress || undefined,
        isBlockchainEnabled: account.isBlockchainEnabled || false,
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw error;
    }
  }
}
