declare module 'bencode' {
  namespace bencode {
    function encode(data: any): Buffer;
    function decode(data: Buffer | string, encoding?: string): any;
  }
  export = bencode;
}
