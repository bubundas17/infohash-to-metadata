import discover from "./discover";
import * as utils from './utils';
import * as defaults from './defaults';
import type { Metadata, MetadataResult } from '../types/metadata';
import type { TorrentMetadata } from './create-torrent-file';

interface TorrentMetadataOptions {
  createdBy?: string;
  comment?: string;
  announce?: string;
  announceList?: string[][];
  private?: boolean;
  source?: string;
  creationDate?: number; // Unix timestamp for creation date
  // Allow any other custom properties
  // [key: string]: any;
}

interface MetadataOptions {
  maxConns?: number;
  fetchTimeout?: number;
  socketTimeout?: number;
  dht?: boolean | any; // Assuming DHT instance can be of any type
  asTorrentBuffer?: boolean; // Whether to return the metadata as a .torrent file buffer
  torrentMetadata?: TorrentMetadataOptions; // Custom torrent metadata
}

type CallbackFunction = (error: Error | null, metadata?: MetadataResult) => void;

const fetchMetadataFromSwarm = (
  infohash: string,
  opts: MetadataOptions = {},
  callbackFn?: CallbackFunction
): Promise<MetadataResult> => {
  utils.validateArgs(infohash, opts, callbackFn);

  const options: Required<MetadataOptions> & { 
    asTorrentBuffer: boolean;
    torrentMetadata: TorrentMetadataOptions; 
  } = {
    maxConns: defaults.DEFAULT_MAX_CONNS,
    fetchTimeout: defaults.DEFAULT_FETCH_TIMEOUT,
    socketTimeout: defaults.DEFAULT_SOCKET_TIMEOUT,
    dht: true,
    asTorrentBuffer: false, // Default to false
    torrentMetadata: {}, // Default empty custom metadata
    ...opts
  };

  return new Promise(async (resolve, reject) => {
    const discovery = discover(infohash, options);
    let timeoutHandle: NodeJS.Timeout;

    discovery.on('_bmd_metadata', async (metadata: Metadata) => {
      clearTimeout(timeoutHandle);
      
      let result: MetadataResult = { ...metadata };
      
      if (options.asTorrentBuffer) {
        try {
          // Dynamically import to avoid circular dependencies
          const { createTorrentBuffer } = await import('./create-torrent-file');
          
          // Prepare torrent metadata with defaults
          const torrentMetadata: TorrentMetadata = {
            info: { pieces: Buffer.from(''), name: 'unknown', ...((metadata as any).info || {}) },
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
                  torrentMetadata.announce = value[0] as string;
                  torrentMetadata['announce-list'] = value.map(url => [url as string]);
                }
              } else {
                (torrentMetadata as any)[key] = value;
              }
            }
          }
          
          // Apply custom metadata if provided
          if (options.torrentMetadata) {
            if (options.torrentMetadata.createdBy) {
              torrentMetadata['created by'] = options.torrentMetadata.createdBy;
            }
            
            if (options.torrentMetadata.comment) {
              (torrentMetadata as any).comment = options.torrentMetadata.comment;
            }
            
            if (options.torrentMetadata.announce) {
              (torrentMetadata as any).announce = options.torrentMetadata.announce;
            }
            
            if (options.torrentMetadata.announceList) {
              (torrentMetadata as any)['announce-list'] = options.torrentMetadata.announceList;
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
                (torrentMetadata as any)[key] = value;
              }
            }
          }
          
          // Create the torrent buffer
          result.torrentBuffer = createTorrentBuffer(torrentMetadata);
        } catch (err) {
          console.error('Error creating torrent buffer:', err);
          // Don't fail the whole operation if buffer creation fails
        }
      }
      
      if (callbackFn) { callbackFn(null, result); }
      resolve(result);
    });

    discovery.on('error', (err: Error) => {
      discovery.destroy();
      clearTimeout(timeoutHandle);
      if (callbackFn) { callbackFn(err); }
      reject(err);
    });

    timeoutHandle = setTimeout(() => {
      const err = new Error(`fetchMetadataFromSwarm timeout after ${options.fetchTimeout}ms`);
      discovery.emit('error', err);
    }, options.fetchTimeout);
  });
};

export default fetchMetadataFromSwarm;
