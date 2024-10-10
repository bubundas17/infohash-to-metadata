interface MetadataOptions {
    maxConns?: number;
    fetchTimeout?: number;
    socketTimeout?: number;
    dht?: boolean | any;
}
interface Metadata {
    info_hash: string;
    name?: string;
}
type CallbackFunction = (error: Error | null, metadata?: Metadata) => void;
declare const fetchMetadataFromSwarm: (infohash: string, opts?: MetadataOptions, callbackFn?: CallbackFunction) => Promise<Metadata>;
export default fetchMetadataFromSwarm;
