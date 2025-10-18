import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// SOCKET IO
import { Server, Socket } from 'socket.io';
import { useAzureSocketIO } from '@azure/web-pubsub-socket.io';

// SERVICES
import { AuthService } from '../Auth/services/auth.service';

// INTERFACES
import { EmitAccess, EmitOrder } from '../Sales/sales.interface';

@Injectable()
export class SocketService {
  public socket = new Server(443, {
    connectionStateRecovery: {},
  });

  private futuraSocketIO: string;

  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly connectedPromoter: Map<string, string[]> = new Map();

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.futuraSocketIO = configService.get('SOCKET_FUTURA_IO');

    // Only use Azure Web PubSub if connection string is provided
    if (this.futuraSocketIO) {
      // @ts-expect-error - Type mismatch between socket.io versions in monorepo
      useAzureSocketIO(this.socket, {
        hub: 'Centro',
        connectionString: this.futuraSocketIO,
      });
    } else {
      console.warn('⚠️  SOCKET_FUTURA_IO not configured. WebSocket will work in local mode only.');
    }

    this.socket.on('connection', async (client: Socket) => {
      const isAuth = await this.authService.decodeToken(client.handshake.query.token as string);
      if (isAuth && isAuth.exp > Date.now() / 1000) this.handleConnection(isAuth.promoter, client);
    });
  }

  public handleConnection(promoter: string, client: Socket): void {
    this.connectedPromoter.set(promoter, [...(this.connectedPromoter.get(promoter) || []), client.id]);
    client.on('disconnect', async (_reason) => {
      this.handleDisconnection(promoter, client);
    });
  }

  public handleDisconnection(promoter: string, client: Socket) {
    const clients = this.connectedPromoter.get(promoter);
    if (clients) {
      this.connectedPromoter.set(
        promoter,
        clients.filter((promoterClientId: string) => promoterClientId != client.id),
      );
    }
    client.disconnect();
  }

  public emitOrderCreated(promoter: string, order: string): void {
    this.socket.to(this.connectedPromoter.get(promoter.toString())).emit('order-created', order);
  }

  public emitTicketTransfer(promoter: string, order: string): void {
    this.socket.to(this.connectedPromoter.get(promoter.toString())).emit('transfer-created', order);
  }

  public emitInvitationCreated(promoter: string, order: EmitOrder): void {
    this.socket.to(this.connectedPromoter.get(promoter.toString())).emit('invitation-created', order);
  }

  public emitTicketMinted(promoter: string, order: string): void {
    this.socket.to(this.connectedPromoter.get(promoter.toString())).emit('ticket-minted', order);
  }

  public emitTicketAccess(promoter: string, access: EmitAccess): void {
    this.socket.to(this.connectedPromoter.get(promoter.toString())).emit('access', access);
  }

  public emitTicketResale(promoter: string, order: string): void {
    this.socket.to(this.connectedPromoter.get(promoter.toString())).emit('ticket-resale', order);
  }

  public emitCancelResale(promoter: string, order: string): void {
    this.socket.to(this.connectedPromoter.get(promoter.toString())).emit('cancel-resale', order);
  }

  public emitOrderCreatedNotification(promoter: string, orderIdNotification: string): void {
    this.socket
      .to(this.connectedPromoter.get(promoter.toString()))
      .emit('order-created-notification', orderIdNotification);
  }
}
