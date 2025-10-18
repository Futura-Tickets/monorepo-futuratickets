// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// SOCKET IO
import { Server, Socket } from 'socket.io';
import { useAzureSocketIO } from '@azure/web-pubsub-socket.io';

// SERVICES
import { AuthService } from 'src/Auth/services/auth.service';

// INTERFACES
import { EmitAccess } from 'src/Sales/sales.interface';

@Injectable()
export class SocketService {
  public socket = new Server({
    // Will attach to the main HTTP server
    pingTimeout: 10000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  private socketAccessEndpoint: string;
  private readonly connectedPromoter: Map<string, string[]> = new Map();

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.socketAccessEndpoint = configService.get('SOCKET_ACCESS');

    // Only initialize Azure Socket.IO if connection string is provided
    if (this.socketAccessEndpoint) {
      useAzureSocketIO(this.socket, {
        hub: 'Centro',
        connectionString: this.socketAccessEndpoint,
      });
    } else {
      console.warn('⚠️  SOCKET_ACCESS not configured. WebSocket functionality will be limited.');
    }

    this.socket.on('connection', async (client: Socket) => {
      const isAuth = await this.authService.decodeToken(client.handshake.query.token as string);
      if (isAuth && isAuth.exp > Date.now() / 1000) this.handleConnection(isAuth.promoter, client);
    });
  }

  public handleConnection(promoter: string, client: Socket): void {
    this.connectedPromoter.set(promoter, [...(this.connectedPromoter.get(promoter) || []), client.id]);
    client.on('disconnect', async (reason) => {
      this.handleDisconnection(promoter, client);
    });
  }

  public handleDisconnection(promoter: string, client: Socket) {
    this.connectedPromoter.set(
      promoter,
      this.connectedPromoter.get(promoter)?.filter((promoterClientId: string) => promoterClientId != client.id)!,
    );
    client.disconnect();
  }

  public emitTicketAccess(promoter: string, access: EmitAccess): void {
    this.socket.to(this.connectedPromoter.get(promoter.toString())).emit('access', access);
  }
}
