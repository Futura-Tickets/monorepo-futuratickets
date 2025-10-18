import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonRpcProvider, WebSocketProvider } from 'ethers';

@Injectable()
export class ProviderService {
  constructor(private configService: ConfigService) {}

  public getProvider(): JsonRpcProvider {
    return new JsonRpcProvider(this.configService.get('HTTP_BASE_SEPOLIA_RPC')!, 84532);
  }

  public getWssProvider(): WebSocketProvider {
    return new WebSocketProvider(this.configService.get('WSS_BASE_SEPOLIA_RPC')!, 84532);
  }
}

// const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/217b75a867d04513992d6154ce86a526", 11155111);
