import Discovery from 'torrent-discovery';
interface DiscoveryOptions {
    dht?: boolean | any;
    maxConns?: number;
    socketTimeout?: number;
}
declare const _default: (infohash: string, opts?: DiscoveryOptions) => Discovery;
export default _default;
