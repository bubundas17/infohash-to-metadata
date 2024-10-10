import { Socket } from 'net';
export interface SocketPool {
    size: number;
    createSocket(): {
        socket: Socket;
        socketId: number;
    };
    destroySocket(socketId: number): void;
    destroyAllSockets(): void;
}
export declare function createSocketPool(): SocketPool;
