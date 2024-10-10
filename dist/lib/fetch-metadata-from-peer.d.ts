import { Socket } from 'net';
interface FetchOptions {
    selfId?: Buffer;
    socket?: Socket;
    timeout?: number;
}
interface PeerAddress {
    address: string;
    port: number;
}
interface Metadata {
    info_hash: string;
    name?: string;
}
type CallbackFunction = (error: Error | null, metadata?: Metadata) => void;
declare const fetchMetadataFromPeer: (infohash: string, peerAddress: string | PeerAddress, opts?: FetchOptions, callbackFn?: CallbackFunction) => Promise<Metadata>;
export default fetchMetadataFromPeer;
