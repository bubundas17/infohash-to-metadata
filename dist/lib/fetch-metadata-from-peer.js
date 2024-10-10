"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bittorrent_protocol_1 = __importDefault(require("bittorrent-protocol"));
const ut_metadata_1 = __importDefault(require("ut_metadata"));
const addr_to_ip_port_1 = __importDefault(require("addr-to-ip-port"));
const randombytes_1 = __importDefault(require("randombytes"));
const bencode_1 = __importDefault(require("bencode"));
const crypto_1 = require("crypto");
const net_1 = require("net");
const parse_torrent_1 = __importDefault(require("parse-torrent"));
const utils_1 = require("./utils");
const defaults_1 = require("./defaults");
const fetchMetadataFromPeer = (infohash, peerAddress, opts = {}, callbackFn) => {
    (0, utils_1.validateArgs)(infohash, opts, callbackFn);
    const selfId = opts.selfId || (0, randombytes_1.default)(20);
    const socket = opts.socket || new net_1.Socket();
    const timeout = opts.timeout || defaults_1.DEFAULT_SOCKET_TIMEOUT;
    const peer = (typeof peerAddress === 'string') ?
        { address: (0, addr_to_ip_port_1.default)(peerAddress)[0], port: (0, addr_to_ip_port_1.default)(peerAddress)[1] } : peerAddress;
    return new Promise((resolve, reject) => {
        socket.setTimeout(timeout, () => {
            socket.destroy();
            const err = new Error(`socket timeout after ${timeout}ms`);
            if (callbackFn) {
                callbackFn(err);
            }
            reject(err);
        });
        socket.connect(peer.port, peer.address, () => {
            const wire = new bittorrent_protocol_1.default();
            socket.pipe(wire).pipe(socket);
            wire.use((0, ut_metadata_1.default)());
            wire.handshake(infohash, selfId, { dht: true });
            wire.on('handshake', (ih, ip) => wire.ut_metadata.fetch());
            wire.ut_metadata.on('metadata', function (rawMetadata) {
                let metadata = null;
                let parsedMetadata = null;
                try {
                    metadata = bencode_1.default.decode(rawMetadata);
                    const infohashOfRawMetadata = (0, crypto_1.createHash)('sha1').update(bencode_1.default.encode(metadata.info)).digest('hex');
                    // Verify the infohash of received metadata.
                    if (infohashOfRawMetadata !== infohash) {
                        metadata = null;
                    }
                }
                catch (err) {
                    metadata = null;
                }
                socket.destroy();
                if (metadata === null) {
                    return socket.emit('error', new Error('fail to fetch metadata'));
                }
                parsedMetadata = (0, parse_torrent_1.default)(rawMetadata);
                if (callbackFn) {
                    callbackFn(null, parsedMetadata);
                }
                resolve(parsedMetadata);
            });
        });
        socket.on('error', (err) => {
            if (!socket.destroyed)
                socket.destroy();
            if (callbackFn) {
                callbackFn(err);
            }
            reject(err);
        });
    });
};
exports.default = fetchMetadataFromPeer;
