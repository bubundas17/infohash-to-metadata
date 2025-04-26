"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bittorrent_dht_1 = __importDefault(require("bittorrent-dht"));
const index_1 = __importDefault(require("../index"));
// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';
// infohash of ubuntu-16.04.1-desktop-amd64.iso
const INFO_HASH2 = '9f9165d9a281a9b8e782cd5176bbcc8256fd1871';
const dht = new bittorrent_dht_1.default({ concurrency: 32 });
// DHT will be created internally.
(0, index_1.default)(INFO_HASH, { maxConns: 100, fetchTimeout: 30000, socketTimeout: 5000 }, (err, metadata) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(`[Callback] ${metadata}`);
});
// Use designated DHT instance.
(0, index_1.default)(INFO_HASH, { maxConns: 100, fetchTimeout: 30000, socketTimeout: 5000, dht })
    .then(metadata => {
    console.log(`[Promise] ${metadata}`);
}).catch(err => {
    console.log(err);
});
// Re-use DHT instance.
(0, index_1.default)(INFO_HASH2, { maxConns: 100, fetchTimeout: 30000, socketTimeout: 5000, dht })
    .then(metadata => {
    console.log(`[Promise] ${metadata}`);
}).catch(err => {
    console.log(err);
});
