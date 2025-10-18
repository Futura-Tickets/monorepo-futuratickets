import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;
  private iv: Buffer;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.key = Buffer.from(configService.get<string>('ENCRYPT_SECRET_KEY')!);
    this.iv = Buffer.from(configService.get<string>('ENCRYPT_SECRET_KEY_VI')!);
  }

  public async registerToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }

  public async decodeToken(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }

  /**
   * Verifies JWT token signature and returns decoded payload
   * SECURITY: Use this instead of decodeToken() for authentication
   * @param token JWT token to verify
   * @returns Decoded and verified token payload
   * @throws UnauthorizedException if token is invalid or expired
   */
  public async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Encrypting text
  public encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), this.iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }
}
