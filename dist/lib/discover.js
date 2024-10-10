"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const torrent_discovery_1 = __importDefault(require("torrent-discovery"));
const addr_to_ip_port_1 = __importDefault(require("addr-to-ip-port"));
const randombytes_1 = __importDefault(require("randombytes"));
const fetch_metadata_from_peer_1 = __importDefault(require("./fetch-metadata-from-peer"));
const socket_pool_1 = require("./socket-pool");
const THIS_PORT = 65534; // THIS_PORT is used when an announce message has been sent to the DHT.
const SELF_ID = (0, randombytes_1.default)(20);
exports.default = (infohash, opts = {}) => {
    const discovery = new torrent_discovery_1.default({ infoHash: infohash, peerId: SELF_ID, port: THIS_PORT, dht: opts.dht });
    discovery._dhtAnnounce = Function.prototype;
    const peerQueue = [];
    const socketPool = (0, socket_pool_1.createSocketPool)();
    discovery.on('peer', (peer) => {
        // console.log(`${peer}`);
        const [address, port] = (0, addr_to_ip_port_1.default)(peer);
        const peerAddress = { address, port };
        if (peerAddress && peerAddress.port !== THIS_PORT) {
            discovery.emit('_bmd_peer_found', peerAddress);
        }
    });
    discovery.on('_bmd_peer_found', (peerAddress) => {
        if (socketPool.size >= (opts.maxConns || 0)) {
            peerQueue.push(peerAddress);
            return;
        }
        const { socket, socketId } = socketPool.createSocket();
        (0, fetch_metadata_from_peer_1.default)(infohash, peerAddress, { selfId: SELF_ID, socket, timeout: opts.socketTimeout })
            .then((metadata) => {
            socketPool.destroyAllSockets();
            // console.log(`peer: ${peerAddress.address}:${peerAddress.port}`);       // <--DEBUG---------------------------
            discovery.emit('_bmd_metadata', metadata);
            discovery.removeAllListeners().destroy();
        })
            .catch((err) => {
            // console.log(err);                                                      // <--DEBUG---------------------------
            socketPool.destroySocket(socketId);
            if (peerQueue.length > 0) {
                discovery.emit('_bmd_peer_found', peerQueue.shift());
            }
        });
    });
    return discovery;
};
