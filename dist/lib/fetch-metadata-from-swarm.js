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
const discover_1 = __importDefault(require("./discover"));
const utils = __importStar(require("./utils"));
const defaults = __importStar(require("./defaults"));
const fetchMetadataFromSwarm = (infohash, opts = {}, callbackFn) => {
    utils.validateArgs(infohash, opts, callbackFn);
    const options = {
        maxConns: defaults.DEFAULT_MAX_CONNS,
        fetchTimeout: defaults.DEFAULT_FETCH_TIMEOUT,
        socketTimeout: defaults.DEFAULT_SOCKET_TIMEOUT,
        dht: true,
        asTorrentBuffer: false, // Default to false
        torrentMetadata: {}, // Default empty custom metadata
        ...opts
    };
    return new Promise(async (resolve, reject) => {
        const discovery = (0, discover_1.default)(infohash, options);
        let timeoutHandle;
        discovery.on('_bmd_metadata', async (metadata) => {
            clearTimeout(timeoutHandle);
            let result = { ...metadata };
            if (options.asTorrentBuffer) {
                try {
                    // Dynamically import to avoid circular dependencies
                    const { createTorrentBuffer } = await Promise.resolve().then(() => __importStar(require('./create-torrent-file')));
                    // Prepare torrent metadata with defaults
                    const torrentMetadata = {
                        info: { pieces: Buffer.from(''), name: 'unknown', ...(metadata.info || {}) },
                        'created by': 'infohash-to-metadata',
                        'creation date': Math.floor(Date.now() / 1000) // Default to current time
                    };
                    // Copy other metadata properties
                    for (const [key, value] of Object.entries(metadata)) {
                        if (key !== 'info' && key !== 'torrentBuffer') {
                            // Handle the announce array specially
                            if (key === 'announce' && Array.isArray(value)) {
                                // If announce is an array, use the first item as announce
                                // and the whole array in announce-list format
                                if (value.length > 0) {
                                    torrentMetadata.announce = value[0];
                                    torrentMetadata['announce-list'] = value.map(url => [url]);
                                }
                            }
                            else {
                                torrentMetadata[key] = value;
                            }
                        }
                    }
                    // Apply custom metadata if provided
                    if (options.torrentMetadata) {
                        if (options.torrentMetadata.createdBy) {
                            torrentMetadata['created by'] = options.torrentMetadata.createdBy;
                        }
                        if (options.torrentMetadata.comment) {
                            torrentMetadata.comment = options.torrentMetadata.comment;
                        }
                        if (options.torrentMetadata.announce) {
                            torrentMetadata.announce = options.torrentMetadata.announce;
                        }
                        if (options.torrentMetadata.announceList) {
                            torrentMetadata['announce-list'] = options.torrentMetadata.announceList;
                        }
                        if (options.torrentMetadata.private !== undefined) {
                            // Private flag must be set in the info dictionary
                            if (!torrentMetadata.info) {
                                torrentMetadata.info = { pieces: Buffer.from(''), name: 'unknown' };
                            }
                            torrentMetadata.info.private = options.torrentMetadata.private ? 1 : 0;
                        }
                        if (options.torrentMetadata.creationDate !== undefined) {
                            torrentMetadata['creation date'] = options.torrentMetadata.creationDate;
                        }
                        // Apply any other custom fields
                        for (const [key, value] of Object.entries(options.torrentMetadata)) {
                            if (!['createdBy', 'comment', 'announce', 'announceList', 'private'].includes(key) && value !== undefined) {
                                torrentMetadata[key] = value;
                            }
                        }
                    }
                    // Create the torrent buffer
                    result.torrentBuffer = createTorrentBuffer(torrentMetadata);
                }
                catch (err) {
                    console.error('Error creating torrent buffer:', err);
                    // Don't fail the whole operation if buffer creation fails
                }
            }
            if (callbackFn) {
                callbackFn(null, result);
            }
            resolve(result);
        });
        discovery.on('error', (err) => {
            discovery.destroy();
            clearTimeout(timeoutHandle);
            if (callbackFn) {
                callbackFn(err);
            }
            reject(err);
        });
        timeoutHandle = setTimeout(() => {
            const err = new Error(`fetchMetadataFromSwarm timeout after ${options.fetchTimeout}ms`);
            discovery.emit('error', err);
        }, options.fetchTimeout);
    });
};
exports.default = fetchMetadataFromSwarm;
