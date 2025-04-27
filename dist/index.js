"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTorrentBuffer = exports.downloadTorrent = exports.createTorrentFile = exports.fromPeer = void 0;
const fetch_metadata_from_swarm_1 = __importDefault(require("./lib/fetch-metadata-from-swarm"));
const fetch_metadata_from_peer_1 = __importDefault(require("./lib/fetch-metadata-from-peer"));
Object.defineProperty(exports, "fromPeer", { enumerable: true, get: function () { return fetch_metadata_from_peer_1.default; } });
const create_torrent_file_1 = require("./lib/create-torrent-file");
Object.defineProperty(exports, "createTorrentFile", { enumerable: true, get: function () { return create_torrent_file_1.createTorrentFile; } });
Object.defineProperty(exports, "downloadTorrent", { enumerable: true, get: function () { return create_torrent_file_1.downloadTorrent; } });
Object.defineProperty(exports, "createTorrentBuffer", { enumerable: true, get: function () { return create_torrent_file_1.createTorrentBuffer; } });
exports.default = fetch_metadata_from_swarm_1.default;
