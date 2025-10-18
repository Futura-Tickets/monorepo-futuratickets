import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

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
}
