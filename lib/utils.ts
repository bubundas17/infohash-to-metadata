interface Options {
  [key: string]: any;
}

type CallbackFunction = (error: Error | null, metadata?: any) => void;

export function validateArgs(infohash: string, opts: Options | undefined, callbackFn: CallbackFunction | undefined): void {
  if (infohash.match(/^[0-9a-fA-F]{40}$/) === null) {
    throw new Error('Invalid infohash.');
  }
  if (opts && typeof opts !== 'object') {
    throw new Error('opts argument must be a plain old Javascript object.');
  }
  if (callbackFn && typeof callbackFn !== 'function') {
    throw new Error('callbackFn argument must be a Javascript function.');
  }
}
