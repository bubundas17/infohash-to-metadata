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
export declare function createTorrentFile(metadata: TorrentMetadata, outputPath?: string): Promise<string>;
/**
 * Downloads a .torrent file from an infohash
 * @param infohash The infohash to download metadata for
 * @param outputPath Path to save the .torrent file (optional)
 * @param options Options for the download
 * @returns Promise resolving to the path of the created .torrent file
 */
export declare function downloadTorrent(infohash: string, outputPath?: string, options?: any): Promise<string>;
/**
 * Creates a .torrent file buffer from metadata without writing to disk
 * @param metadata The torrent metadata
 * @returns Buffer containing the encoded .torrent file
 */
export declare function createTorrentBuffer(metadata: TorrentMetadata): Buffer;
export {};
