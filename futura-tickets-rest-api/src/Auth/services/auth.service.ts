import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {

    private algorithm = 'aes-256-cbc';
    private key: Buffer;
    private iv: Buffer;

    constructor(
        private configService: ConfigService
    ) {
        this.key = Buffer.from(configService.get<string>('ENCRYPT_SECRET_KEY')!);
        this.iv = Buffer.from(configService.get<string>('ENCRYPT_SECRET_KEY_VI')!);
    }

    // Encrypting text
    public encrypt(text: string): string {
        let cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), this.iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex');
    };

    // Decrypting text
    public decrypt(encryptedData: string): string {
        let iv = Buffer.from(this.iv.toString('hex'), 'hex');
        let encryptedText = Buffer.from(encryptedData, 'hex');
        let decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    };
    
}