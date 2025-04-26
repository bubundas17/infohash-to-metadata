import fs from 'fs';
import path from 'path';
import bencode from 'bencode';

interface TorrentMetadata {
  info: {
    name?: string;
    pieces: Buffer;
    'piece length'?: number;
    length?: number;
    files?: Array<{
      path: string[];
      length: number;
    }>;
    [key: string]: any;
  };
  announce?: string;
  'announce-list'?: string[][];
  'creation date'?: number;
  comment?: string;
  'created by'?: string;
  [key: string]: any;
}

/**
 * Creates a .torrent file from metadata
 * @param metadata The torrent metadata
 * @param outputPath Path to save the .torrent file (optional, defaults to metadata.info.name + '.torrent')
 * @returns Promise resolving to the path of the created .torrent file
 */
export function createTorrentFile(
  metadata: TorrentMetadata, 
  outputPath?: string
): Promise<string> {
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
      const outputDir = path.dirname(outputPath);
      if (outputDir !== '.' && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
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
      const torrentData = bencode.encode(metadata);

      // Write to file
      fs.writeFileSync(outputPath, torrentData);
      resolve(outputPath);
    } catch (err) {
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
export async function downloadTorrent(
  infohash: string, 
  outputPath?: string, 
  options: any = {}
): Promise<string> {
  // Dynamically import to avoid circular dependencies
  const { default: fetchMetadata } = await import('../index');
  
  // Get metadata
  const rawMetadata = await fetchMetadata(infohash, options) as any;
  
  // Create basic torrent metadata structure
  const torrentMetadata: TorrentMetadata = {
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

/**
 * Creates a .torrent file buffer from metadata without writing to disk
 * @param metadata The torrent metadata
 * @returns Buffer containing the encoded .torrent file
 */
export function createTorrentBuffer(metadata: TorrentMetadata): Buffer {
  // Ensure metadata has required fields
  if (!metadata.info) {
    throw new Error('Invalid metadata: missing info dictionary');
  }

  // Add creation date if missing
  if (!metadata['creation date']) {
    metadata['creation date'] = Math.floor(Date.now() / 1000);
  }

  // Add created by if missing
  if (!metadata['created by']) {
    metadata['created by'] = 'infohash-to-metadata';
  }

  // Encode metadata to bencoded buffer and return
  return bencode.encode(metadata);
} 