import DHT from 'bittorrent-dht';
import fetchMetadata from '../index';
import { writeFileSync } from 'fs';

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';
// infohash of ubuntu-16.04.1-desktop-amd64.iso
const INFO_HASH2 = '9f9165d9a281a9b8e782cd5176bbcc8256fd1871';

const dht = new DHT({ concurrency: 32 });

// DHT will be created internally.
fetchMetadata(INFO_HASH, { maxConns: 100, fetchTimeout: 30000, socketTimeout: 5000, asTorrentBuffer: true },
  (err, metadata) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`[Callback] ${metadata}`);
    writeFileSync('ubuntu-server.json', JSON.stringify(metadata, (key, value) => {
      // Check if the value is a Buffer
      if (typeof value === 'object' && value !== null && value.type === 'Buffer' && Array.isArray(value.data)) {
        return '<Buffer>';
      }
      // For Buffer objects directly (might be needed depending on how metadata is structured)
      if (Buffer.isBuffer(value)) {
        return '<Buffer>';
      }
      // For Uint8Array objects
      if (value instanceof Uint8Array) {
        return '<Uint8array>';
      }
      return value; // Return other values unchanged
    }));
  });

// Use designated DHT instance.
fetchMetadata(INFO_HASH, { maxConns: 100, fetchTimeout: 30000, socketTimeout: 5000, dht })
  .then(metadata => {
    console.log(`[Promise] ${metadata}`);
  }).catch(err => {
    console.log(err);
  });

// Re-use DHT instance.
fetchMetadata(INFO_HASH2, { maxConns: 100, fetchTimeout: 30000, socketTimeout: 5000, dht })
  .then(metadata => {
    console.log(`[Promise] ${metadata}`);
  }).catch(err => {
    console.log(err);
  });
