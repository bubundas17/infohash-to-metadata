"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocketPool = createSocketPool;
const net_1 = require("net");
class SocketPoolImpl {
    constructor() {
        this._pool = new Map();
        this._socketId = 0;
    }
    get size() {
        return this._pool.size;
    }
    createSocket() {
        const socket = new net_1.Socket();
        this._socketId++;
        this._pool.set(this._socketId, socket);
        return { socket, socketId: this._socketId };
    }
    destroySocket(socketId) {
        if (!this._pool.has(socketId))
            return;
        const socket = this._pool.get(socketId);
        if (socket && !socket.destroyed) {
            socket.destroy();
        }
        this._pool.delete(socketId);
    }
    destroyAllSockets() {
        for (let socket of this._pool.values()) {
            if (!socket.destroyed) {
                socket.destroy();
            }
        }
        this._pool.clear();
    }
}
function createSocketPool() {
    return new SocketPoolImpl();
}
