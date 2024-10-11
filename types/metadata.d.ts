export interface Metadata {
  info_hash: string;
  name?: string;
  info: {
    name: Buffer;
    [key: string]: Buffer | number | string;
  };
  [key: string]: unknown;
}

declare module 'ut_metadata' {
  function ut_metadata(): {
    fetch: () => void;
    on: (event: string, callback: (metadata: Buffer) => void) => void;
  };
  export = ut_metadata;
}
