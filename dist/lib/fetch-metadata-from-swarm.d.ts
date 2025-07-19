import type { MetadataResult } from '../types/metadata';
interface TorrentMetadataOptions {
    createdBy?: string;
    comment?: string;
    announce?: string;
    announceList?: string[][];
    private?: boolean;
    source?: string;
    creationDate?: number;
}
interface MetadataOptions {
    maxConns?: number;
    fetchTimeout?: number;
    socketTimeout?: number;
    dht?: boolean | any;
    asTorrentBuffer?: boolean;
    torrentMetadata?: TorrentMetadataOptions;
}
type CallbackFunction = (error: Error | null, metadata?: MetadataResult) => void;
declare const fetchMetadataFromSwarm: (infohash: string, opts?: MetadataOptions, callbackFn?: CallbackFunction) => Promise<MetadataResult>;
export default fetchMetadataFromSwarm;
