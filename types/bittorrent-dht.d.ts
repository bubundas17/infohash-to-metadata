declare module 'bittorrent-dht' {
  interface DHTOptions {
    concurrency?: number;
    [key: string]: any;
  }

  class DHT {
    constructor(options?: DHTOptions);
  }

  export = DHT;
}
