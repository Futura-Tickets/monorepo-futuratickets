import { io, Socket } from "socket.io-client";

export var socketAccess: Socket;

export const initSocketAccess = (): void => {
    // Skip if URL is not configured
    if (!process.env.NEXT_PUBLIC_SOCKET_ACCESS_URL) {
        console.warn('NEXT_PUBLIC_SOCKET_ACCESS_URL not configured - Socket Access disabled');
        return;
    }

    console.log('Initialing socket access ...');

    socketAccess = io(process.env.NEXT_PUBLIC_SOCKET_ACCESS_URL as string, {
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
        console.log('Socket access connected!');
    };

    const onDisconnect = (reason: string) => {
        console.log('Socket access disconnected!', reason);
    };

    const onReconnect = (attemptNumber: number) => {
        console.log('Socket access reconnected after', attemptNumber, 'attempts');
    };

    const onReconnectAttempt = (attemptNumber: number) => {
        console.log('Socket access reconnection attempt', attemptNumber);
    };

    const onReconnectError = (error: Error) => {
        console.error('Socket access reconnection error:', error);
    };

    const onReconnectFailed = () => {
        console.error('Socket access reconnection failed after maximum attempts');
    };

    const onConnectError = (error: Error) => {
        console.error('Socket access connection error:', error);
    };

    socketAccess.on('connect', onConnect);
    socketAccess.on('disconnect', onDisconnect);
    socketAccess.on('reconnect', onReconnect);
    socketAccess.on('reconnect_attempt', onReconnectAttempt);
    socketAccess.on('reconnect_error', onReconnectError);
    socketAccess.on('reconnect_failed', onReconnectFailed);
    socketAccess.on('connect_error', onConnectError);

};
