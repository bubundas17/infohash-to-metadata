"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromPeer = void 0;
const fetch_metadata_from_swarm_1 = __importDefault(require("./lib/fetch-metadata-from-swarm"));
const fetch_metadata_from_peer_1 = __importDefault(require("./lib/fetch-metadata-from-peer"));
Object.defineProperty(exports, "fromPeer", { enumerable: true, get: function () { return fetch_metadata_from_peer_1.default; } });
exports.default = fetch_metadata_from_swarm_1.default;
