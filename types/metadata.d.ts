export interface Metadata {
  info_hash: string;
  infoHash?: string;
  infoHashBuffer?: Buffer | Uint8Array;
  name?: string;
  info?: {
    name: Buffer | Uint8Array;
    pieces: Buffer | Uint8Array;
    length?: number;
    "piece length"?: number;
    [key: string]: Buffer | Uint8Array | number | string;
  };
  infoBuffer?: Buffer | Uint8Array;
  announce?: string[] | string;
  urlList?: string[];
  files?: {
    path: string;
    name: string;
    length: number;
    offset: number;
  }[];
  length?: number;
  pieceLength?: number;
  lastPieceLength?: number;
  pieces?: string[];
  [key: string]: unknown;
}

interface MetadataResult extends Metadata {
  torrentBuffer?: Buffer | Uint8Array;
}

declare module 'ut_metadata' {
  function ut_metadata(): {
    fetch: () => void;
    on: (event: string, callback: (metadata: Buffer) => void) => void;
  };
  export = ut_metadata;
}
