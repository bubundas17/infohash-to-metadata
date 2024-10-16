import DHT from 'bittorrent-dht';
import fetchMetadata from '../index.js';

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';
// infohash of ubuntu-16.04.1-desktop-amd64.iso
const INFO_HASH2 = '9f9165d9a281a9b8e782cd5176bbcc8256fd1871';

const dht = new DHT({ concurrency: 32 });

// DHT will be created internally.
fetchMetadata(INFO_HASH, { maxConns: 100, fetchTimeout: 30000, socketTimeout: 5000 },
  (err, metadata) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`[Callback] ${metadata}`);
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
