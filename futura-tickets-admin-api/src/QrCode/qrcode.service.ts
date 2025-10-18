import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

// SERVICE
import { PromoterService } from '../Promoter/promoter.service';

// INTERFACES
import { PromoterMsg } from './qrcode.interface';

@Injectable()
export class QrCodeService {
  constructor(private promoterService: PromoterService) {}

  private async signCode(promoter: string, msgSignature: PromoterMsg): Promise<string> {
    const promoterKey = await this.promoterService.getPromoterPrivateKeyById(promoter);
    const signer = new ethers.Wallet(promoterKey?.key as `0x${string}`);

    const message = JSON.stringify(msgSignature);
    return signer.signMessage(message);
  }

  public verifyCode(msgSignature: PromoterMsg, authenticitySignature: string): string {
    const message = JSON.stringify(msgSignature);
    return ethers.verifyMessage(message, authenticitySignature);
  }
}
