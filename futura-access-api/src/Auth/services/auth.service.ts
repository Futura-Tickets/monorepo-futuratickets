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
}
