declare module 'torrent-discovery' {
  import { EventEmitter } from 'events';

  interface DiscoveryOptions {
    infoHash: string;
    peerId: Buffer;
    port: number;
    dht: boolean | any;
  }

  class Discovery extends EventEmitter {
    constructor(options: DiscoveryOptions);
    _dhtAnnounce: Function;
    removeAllListeners(): this;
    destroy(): void;
  }

  export = Discovery;
}
