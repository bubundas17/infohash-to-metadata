import discover from "./discover";
import * as utils from './utils';
import * as defaults from './defaults';

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

interface Metadata {
  // Define the structure of metadata here
  // For example:
  info_hash: string;
  name?: string;
  // Add other properties as needed
}

// Extended return type that may include a torrent buffer
interface MetadataResult extends Metadata {
  torrentBuffer?: Buffer; // Optional torrent buffer if asTorrentBuffer is true
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
          const torrentMetadata = {
            info: { pieces: Buffer.from(''), name: 'unknown', ...((metadata as any).info || {}) },
            ...metadata,
            'created by': 'infohash-to-metadata',
            'creation date': Math.floor(Date.now() / 1000) // Default to current time
          };
          
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
