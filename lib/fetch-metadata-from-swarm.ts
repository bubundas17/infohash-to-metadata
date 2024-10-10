import discover from "./discover";
import * as utils from './utils';
import * as defaults from './defaults';

interface MetadataOptions {
  maxConns?: number;
  fetchTimeout?: number;
  socketTimeout?: number;
  dht?: boolean | any; // Assuming DHT instance can be of any type
}

interface Metadata {
  // Define the structure of metadata here
  // For example:
  info_hash: string;
  name?: string;
  // Add other properties as needed
}

type CallbackFunction = (error: Error | null, metadata?: Metadata) => void;

const fetchMetadataFromSwarm = (
  infohash: string,
  opts: MetadataOptions = {},
  callbackFn?: CallbackFunction
): Promise<Metadata> => {
  utils.validateArgs(infohash, opts, callbackFn);

  const options: Required<MetadataOptions> = {
    maxConns: defaults.DEFAULT_MAX_CONNS,
    fetchTimeout: defaults.DEFAULT_FETCH_TIMEOUT,
    socketTimeout: defaults.DEFAULT_SOCKET_TIMEOUT,
    dht: true,
    ...opts
  };

  return new Promise((resolve, reject) => {
    const discovery = discover(infohash, options);
    let timeoutHandle: NodeJS.Timeout;

    discovery.on('_bmd_metadata', (metadata: Metadata) => {
      clearTimeout(timeoutHandle);
      if (callbackFn) { callbackFn(null, metadata); }
      resolve(metadata);
    });

    discovery.on('error', (err: Error) => {
      discovery.destroy();
      clearTimeout(timeoutHandle);
      if (callbackFn) { callbackFn(err); }
      reject(err);
    });

    timeoutHandle = setTimeout(() => {
      const err = new Error(`fetchMetadataFromSwarm timeout after ${options.fetchTimeout}ms`);
      discovery.emit('error', err);
    }, options.fetchTimeout);
  });
};

export default fetchMetadataFromSwarm;
