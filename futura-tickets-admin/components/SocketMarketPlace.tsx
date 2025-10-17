import { io, Socket } from "socket.io-client";

export var socketMarketPlace: Socket;

export const initSocketMarketPlace = (): void => {
    // Skip if URL is not configured
    if (!process.env.NEXT_PUBLIC_SOCKET_MARKET_PLACE_URL) {
        console.warn('NEXT_PUBLIC_SOCKET_MARKET_PLACE_URL not configured - Socket Marketplace disabled');
        return;
    }

    console.log('Initialing socket marketplace ...');

    socketMarketPlace = io(process.env.NEXT_PUBLIC_SOCKET_MARKET_PLACE_URL as string, {
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
        console.log('Socket marketplace connected!');
    };

    const onDisconnect = (reason: string) => {
        console.log('Socket marketplace disconnected!', reason);
    };

    const onReconnect = (attemptNumber: number) => {
        console.log('Socket marketplace reconnected after', attemptNumber, 'attempts');
    };

    const onReconnectAttempt = (attemptNumber: number) => {
        console.log('Socket marketplace reconnection attempt', attemptNumber);
    };

    const onReconnectError = (error: Error) => {
        console.error('Socket marketplace reconnection error:', error);
    };

    const onReconnectFailed = () => {
        console.error('Socket marketplace reconnection failed after maximum attempts');
    };

    const onConnectError = (error: Error) => {
        console.error('Socket marketplace connection error:', error);
    };

    socketMarketPlace.on('connect', onConnect);
    socketMarketPlace.on('disconnect', onDisconnect);
    socketMarketPlace.on('reconnect', onReconnect);
    socketMarketPlace.on('reconnect_attempt', onReconnectAttempt);
    socketMarketPlace.on('reconnect_error', onReconnectError);
    socketMarketPlace.on('reconnect_failed', onReconnectFailed);
    socketMarketPlace.on('connect_error', onConnectError);

};
