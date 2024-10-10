declare module 'bittorrent-protocol' {
  import { Duplex } from 'stream';

  class Protocol extends Duplex {
    constructor();
    use(extension: any): void;
    handshake(infoHash: string | Buffer, peerId: string | Buffer, extensions?: object): void;
    on(event: string, listener: Function): this;
    ut_metadata: any;
  }

  export = Protocol;
}
