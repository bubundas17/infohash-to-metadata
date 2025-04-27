"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const fs_1 = __importDefault(require("fs"));
// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';
// Example: Get metadata with custom torrent metadata
(0, index_1.default)(INFO_HASH, {
    maxConns: 100,
    fetchTimeout: 30000,
    socketTimeout: 5000,
    asTorrentBuffer: true,
    torrentMetadata: {
        createdBy: 'bitsearch.to',
        comment: 'bitsearch.to',
        announce: 'http://tracker.example.com/announce',
        announceList: [
            ['http://tracker1.example.com/announce'],
            ['http://tracker2.example.com/announce']
        ],
        source: 'Custom Source',
        creationDate: Math.floor(new Date('2023-04-15').getTime() / 1000) // Custom date: April 15, 2023
    }
})
    .then(result => {
    // Check if torrent buffer was generated
    if (result.torrentBuffer) {
        console.log(`Torrent buffer size: ${result.torrentBuffer.length} bytes`);
        // Write buffer to file to demonstrate it works
        fs_1.default.writeFileSync('custom-metadata.torrent', result.torrentBuffer);
        console.log('Custom torrent saved to: custom-metadata.torrent');
    }
    else {
        console.log('No torrent buffer was generated');
    }
})
    .catch(err => {
    console.error('Error:', err);
});
