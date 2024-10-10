import { Socket } from 'net';

export interface SocketPool {
  size: number;
  createSocket(): { socket: Socket; socketId: number };
  destroySocket(socketId: number): void;
  destroyAllSockets(): void;
}

class SocketPoolImpl implements SocketPool {
  private _pool: Map<number, Socket>;
  private _socketId: number;

  constructor() {
    this._pool = new Map();
    this._socketId = 0;
  }

  get size(): number {
    return this._pool.size;
  }

  createSocket(): { socket: Socket; socketId: number } {
    const socket = new Socket();
    this._socketId++;
    this._pool.set(this._socketId, socket);
    return { socket, socketId: this._socketId };
  }

  destroySocket(socketId: number): void {
    if (!this._pool.has(socketId)) return;
    const socket = this._pool.get(socketId);
    if (socket && !socket.destroyed) { socket.destroy(); }
    this._pool.delete(socketId);
  }

  destroyAllSockets(): void {
    for (let socket of this._pool.values()) { 
      if (!socket.destroyed) {
        socket.destroy();
      }
    }
    this._pool.clear();
  }
}

export function createSocketPool(): SocketPool {
  return new SocketPoolImpl();
}
