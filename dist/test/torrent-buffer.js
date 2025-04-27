"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const fs_1 = __importDefault(require("fs"));
// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';
// Example: Get metadata with torrent buffer
(0, index_1.default)(INFO_HASH, {
    maxConns: 100,
    fetchTimeout: 30000,
    socketTimeout: 5000,
    asTorrentBuffer: true // Enable torrent buffer generation
})
    .then(result => {
    var _a, _b;
    // Access name using type assertion since we know the structure
    const metadata = result;
    console.log('Metadata received:', ((_b = (_a = metadata.info) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toString()) || 'Unknown');
    // Check if torrent buffer was generated
    if (result.torrentBuffer) {
        console.log(`Torrent buffer size: ${result.torrentBuffer.length} bytes`);
        // Write buffer to file to demonstrate it works
        fs_1.default.writeFileSync('from-buffer.torrent', result.torrentBuffer);
        console.log('Torrent buffer saved to: from-buffer.torrent');
    }
    else {
        console.log('No torrent buffer was generated');
    }
})
    .catch(err => {
    console.error('Error:', err);
});
