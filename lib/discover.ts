import Discovery from 'torrent-discovery';
import ut_metadata from 'ut_metadata';
import addrToIPPort from 'addr-to-ip-port';
import randombytes from 'randombytes';
import net from 'net';
import fetchMetadataFromPeer from './fetch-metadata-from-peer';
import { createSocketPool } from './socket-pool';
import type { SocketPool } from './socket-pool';

const THIS_PORT: number = 65534;    // THIS_PORT is used when an announce message has been sent to the DHT.
const SELF_ID: Buffer = randombytes(20);

interface DiscoveryOptions {
  dht?: boolean | any;
  maxConns?: number;
  socketTimeout?: number;
}

interface PeerAddress {
  address: string;
  port: number;
}

interface Metadata {
  // Define the structure of metadata here
  [key: string]: any;
}

export default (infohash: string, opts: DiscoveryOptions = {}): Discovery => {
  const discovery = new Discovery({ infoHash: infohash, peerId: SELF_ID, port: THIS_PORT, dht: opts.dht });
  discovery._dhtAnnounce = Function.prototype;

  const peerQueue: PeerAddress[] = [];
  const socketPool: SocketPool = createSocketPool();

  discovery.on('peer', (peer: string) => {
    // console.log(`${peer}`);
    const [address, port] = addrToIPPort(peer);
    const peerAddress: PeerAddress = { address, port };
    if (peerAddress && peerAddress.port !== THIS_PORT) {
      discovery.emit('_bmd_peer_found', peerAddress);
    }
  });

  discovery.on('_bmd_peer_found', (peerAddress: PeerAddress) => {
    if (socketPool.size >= (opts.maxConns || 0)) {
      peerQueue.push(peerAddress);
      return;
    }
    const { socket, socketId } = socketPool.createSocket();
    fetchMetadataFromPeer(infohash, peerAddress, { selfId: SELF_ID, socket, timeout: opts.socketTimeout })
      .then((metadata: Metadata) => {
        socketPool.destroyAllSockets();
        // console.log(`peer: ${peerAddress.address}:${peerAddress.port}`);       // <--DEBUG---------------------------
        discovery.emit('_bmd_metadata', metadata);
        discovery.removeAllListeners().destroy();
      })
      .catch((err: Error) => {
        // console.log(err);                                                      // <--DEBUG---------------------------
        socketPool.destroySocket(socketId);
        if (peerQueue.length > 0) {
          discovery.emit('_bmd_peer_found', peerQueue.shift() as PeerAddress);
        }
      });
  });

  return discovery;
}
