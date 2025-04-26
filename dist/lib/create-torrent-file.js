"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTorrentFile = createTorrentFile;
exports.downloadTorrent = downloadTorrent;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bencode_1 = __importDefault(require("bencode"));
/**
 * Creates a .torrent file from metadata
 * @param metadata The torrent metadata
 * @param outputPath Path to save the .torrent file (optional, defaults to metadata.info.name + '.torrent')
 * @returns Promise resolving to the path of the created .torrent file
 */
function createTorrentFile(metadata, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Ensure metadata has required fields
            if (!metadata.info) {
                throw new Error('Invalid metadata: missing info dictionary');
            }
            // If no output path is provided, use the torrent name + .torrent
            if (!outputPath) {
                const torrentName = metadata.info.name || 'unknown';
                outputPath = `${torrentName}.torrent`;
            }
            // Make sure output directory exists
            const outputDir = path_1.default.dirname(outputPath);
            if (outputDir !== '.' && !fs_1.default.existsSync(outputDir)) {
                fs_1.default.mkdirSync(outputDir, { recursive: true });
            }
            // Add creation date if missing
            if (!metadata['creation date']) {
                metadata['creation date'] = Math.floor(Date.now() / 1000);
            }
            // Add created by if missing
            if (!metadata['created by']) {
                metadata['created by'] = 'infohash-to-metadata';
            }
            // Encode metadata to bencoded buffer
            const torrentData = bencode_1.default.encode(metadata);
            // Write to file
            fs_1.default.writeFileSync(outputPath, torrentData);
            resolve(outputPath);
        }
        catch (err) {
            reject(err);
        }
    });
}
/**
 * Downloads a .torrent file from an infohash
 * @param infohash The infohash to download metadata for
 * @param outputPath Path to save the .torrent file (optional)
 * @param options Options for the download
 * @returns Promise resolving to the path of the created .torrent file
 */
async function downloadTorrent(infohash, outputPath, options = {}) {
    // Dynamically import to avoid circular dependencies
    const { default: fetchMetadata } = await Promise.resolve().then(() => __importStar(require('../index')));
    // Get metadata
    const rawMetadata = await fetchMetadata(infohash, options);
    // Create basic torrent metadata structure
    const torrentMetadata = {
        info: {
            name: 'unknown',
            pieces: Buffer.from(''),
        },
        'created by': 'infohash-to-metadata',
        'creation date': Math.floor(Date.now() / 1000)
    };
    // Safely copy all properties from raw metadata
    if (rawMetadata) {
        // Copy non-info properties
        Object.keys(rawMetadata).forEach(key => {
            if (key !== 'info') {
                torrentMetadata[key] = rawMetadata[key];
            }
        });
        // Copy info properties if they exist
        if (rawMetadata.info && typeof rawMetadata.info === 'object') {
            Object.keys(rawMetadata.info).forEach(key => {
                torrentMetadata.info[key] = rawMetadata.info[key];
            });
        }
    }
    // Create torrent file
    return createTorrentFile(torrentMetadata, outputPath);
}
