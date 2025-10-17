import { io, Socket } from "socket.io-client";

export var socket: Socket;

export const initSocket = (): void => {
    // Skip if URL is not configured
    if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
        console.warn('NEXT_PUBLIC_SOCKET_URL not configured - Socket.IO disabled');
        return;
    }

    console.log('Initialing socket ...', process.env.NEXT_PUBLIC_SOCKET_URL);

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
        path: "/clients/socketio/hubs/Centro",
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,  // Reduced from 10
        reconnectionDelay: 2000,  // Increased from 1000
        reconnectionDelayMax: 5000,
        timeout: 10000,  // Reduced from 20000
        query: {
            token: localStorage.getItem('token')
        }
    });

    const onConnect = () => {
        console.log('Socket connected!');
    };

    const onDisconnect = (reason: string) => {
        console.log('Socket disconnected!', reason);
    };

    const onReconnect = (attemptNumber: number) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
    };

    const onReconnectAttempt = (attemptNumber: number) => {
        console.log('Socket reconnection attempt', attemptNumber);
    };

    const onReconnectError = (error: Error) => {
        console.error('Socket reconnection error:', error);
    };

    const onReconnectFailed = () => {
        console.error('Socket reconnection failed after maximum attempts');
    };

    const onConnectError = (error: Error) => {
        console.error('Socket connection error:', error);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('reconnect_error', onReconnectError);
    socket.on('reconnect_failed', onReconnectFailed);
    socket.on('connect_error', onConnectError);

};
