import { io, Socket } from 'socket.io-client';

interface WebSocketConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class WebSocketManager {
  private sockets: Map<string, Socket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();

  connect(key: string, config: WebSocketConfig): Socket {
    if (this.sockets.has(key)) {
      return this.sockets.get(key)!;
    }

    const socket = io(config.url, {
      transports: ['websocket', 'polling'],
      reconnection: config.autoReconnect ?? true,
      reconnectionDelay: config.reconnectInterval ?? 1000,
      reconnectionAttempts: config.maxReconnectAttempts ?? 5,
      timeout: 20000,
    });

    socket.on('connect', () => {
      this.reconnectAttempts.set(key, 0);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      const attempts = this.reconnectAttempts.get(key) || 0;
      this.reconnectAttempts.set(key, attempts + 1);
      
      if (attempts >= (config.maxReconnectAttempts || 5)) {
        socket.disconnect();
        this.sockets.delete(key);
      }
    });

    this.sockets.set(key, socket);
    return socket;
  }

  disconnect(key: string) {
    const socket = this.sockets.get(key);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(key);
      this.reconnectAttempts.delete(key);
    }
  }

  disconnectAll() {
    this.sockets.forEach((socket) => socket.disconnect());
    this.sockets.clear();
    this.reconnectAttempts.clear();
  }

  getSocket(key: string): Socket | undefined {
    return this.sockets.get(key);
  }

  isConnected(key: string): boolean {
    const socket = this.sockets.get(key);
    return socket ? socket.connected : false;
  }
}

export const wsManager = new WebSocketManager();
