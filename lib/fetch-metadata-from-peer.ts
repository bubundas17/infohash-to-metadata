import Protocol from 'bittorrent-protocol';
import ut_metadata from 'ut_metadata';
import addrToIPPort from 'addr-to-ip-port';
import randombytes from 'randombytes';
import bencode from 'bencode';
import { createHash } from 'crypto';
import { Socket } from 'net';
import ParseTorrent from 'parse-torrent';

import { validateArgs } from './utils';
import { DEFAULT_SOCKET_TIMEOUT } from './defaults';

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
  // Add other properties as needed
}

interface DecodedMetadata {
  info: {
    [key: string]: any;
  };
  [key: string]: any;
}

type CallbackFunction = (error: Error | null, metadata?: Metadata) => void;

interface UtMetadata {
  fetch: () => void;
  on(event: string, callback: (metadata: Buffer) => void): void;
}

const fetchMetadataFromPeer = (
  infohash: string,
  peerAddress: string | PeerAddress,
  opts: FetchOptions = {},
  callbackFn?: CallbackFunction
): Promise<Metadata> => {
  validateArgs(infohash, opts, callbackFn);
  const selfId: Buffer = opts.selfId || randombytes(20);
  const socket: Socket = opts.socket || new Socket();
  const timeout: number = opts.timeout || DEFAULT_SOCKET_TIMEOUT;
  const peer: PeerAddress = (typeof peerAddress === 'string') ?
    { address: addrToIPPort(peerAddress)[0], port: addrToIPPort(peerAddress)[1] } : peerAddress;

  return new Promise((resolve, reject) => {
    socket.setTimeout(timeout, () => {
      socket.destroy();
      const err = new Error(`socket timeout after ${timeout}ms`);
      if (callbackFn) { callbackFn(err); }
      reject(err);
    });

    socket.connect(peer.port, peer.address, () => {
      const wire: Protocol = new Protocol();
      socket.pipe(wire).pipe(socket);
      wire.use(ut_metadata());

      wire.handshake(infohash, selfId, { dht: true });
      wire.on('handshake', (ih: string, ip: string) => (wire.ut_metadata as UtMetadata).fetch());
      (wire.ut_metadata as UtMetadata).on('metadata', function (rawMetadata: Buffer) {
        let metadata: DecodedMetadata | null = null;
        let parsedMetadata: Metadata | null = null;
        try {
          metadata = bencode.decode(rawMetadata) as DecodedMetadata;
          const infohashOfRawMetadata = createHash('sha1').update(bencode.encode(metadata.info)).digest('hex');
          // Verify the infohash of received metadata.
          if (infohashOfRawMetadata !== infohash) { metadata = null; }
        } catch (err) { metadata = null; }
        socket.destroy();
        if (metadata === null) { return socket.emit('error', new Error('fail to fetch metadata')); }

        parsedMetadata = ParseTorrent(rawMetadata) as Metadata;

        if (callbackFn) { callbackFn(null, parsedMetadata); }
        resolve(parsedMetadata);
      });
    });

    socket.on('error', (err: Error) => {
      if (!socket.destroyed) socket.destroy();
      if (callbackFn) { callbackFn(err); }
      reject(err);
    });
  });
};

export default fetchMetadataFromPeer;
