# bep9-metadata-dl

### Download the metadata from peers using infohash only

This module uses [bittorrent-protocol](https://github.com/feross/bittorrent-protocol), [ut_metadata](https://github.com/feross/ut_metadata) and
[torrent-discovery](https://github.com/feross/torrent-discovery) modules of [WebTorrent](https://github.com/feross/webtorrent) to download the info-dictionary part of a .torrent file using infohash of magnet links only.

## Features

- Simple API with callback and Promise interface
- Find peers from the DHT network
- Download and save .torrent files from infohash

## install

```
npm install infohash-to-metadata
```

## API

### `fetchMetadata(infohash, [opts], [callbackFn])`
### `fetchMetadata.fromPeer(infohash, peerAddress, [opts], [callbackFn])`
### `fetchMetadata.createTorrentFile(metadata, [outputPath])`
### `fetchMetadata.downloadTorrent(infohash, [outputPath], [opts])`

Optional options are:
```js
{ 
  maxConns: 10,           // Maximum connections to peers, (default=5) 
  fetchTimeout: 30000,    // A timer scheduled to keep looking for metadata (default=20000)
  socketTimeout: 5000,    // Sets the socket to timeout after inactivity (default=5000)
  dht: DHT instance,      // Use external DHT instance (default=internael DHT instance)
  asTorrentBuffer: false, // Whether to include torrent file as buffer in the result (default=false)
  torrentMetadata: {      // Custom torrent metadata for the generated .torrent file
    createdBy: 'Your App', // Creator name (default='infohash-to-metadata')
    comment: 'Your comment', // Torrent comment
    announce: 'http://tracker.example.com/announce', // Primary tracker URL
    announceList: [['http://tracker1.example.com/announce'], ['http://tracker2.example.com/announce']], // Tracker lists
    creationDate: 1619712000 // Unix timestamp for creation date (default=current time)
  }
}
```

### Example:
```js
const fetchMetadata = require('infohash-to-metadata');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

fetchMetadata(INFO_HASH, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000 },
  (err, metadata) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`[Callback] ${metadata.info.name.toString('utf-8')}`);
});
```
### Or Promise based:
```js
const fetchMetadata = require('infohash-to-metadata');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

fetchMetadata(INFO_HASH, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000 })
.then(metadata => {
  console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
}).catch(err => {
  console.log(err);
});
```
### Re-use DHT instance:
```js
const DHT = require('bittorrent-dht');
const fetchMetadata = require('infohash-to-metadata');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';
// infohash of ubuntu-16.04.1-desktop-amd64.iso
const INFO_HASH2 = '9f9165d9a281a9b8e782cd5176bbcc8256fd1871';
// Check https://github.com/feross/bittorrent-dht for DHT opts
const dht = new DHT({ concurrency: 32 });

// Use designated DHT instance.
fetchMetadata(INFO_HASH, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000, dht })
.then(metadata => {
  console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
}).catch(err => {
  console.log(err);
});

// Re-use DHT instance.
fetchMetadata(INFO_HASH2, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000, dht })
.then(metadata => {
  console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
}).catch(err => {
  console.log(err);
});
```
### Download directly from a peer:
```js
const fetchMetadata = require('infohash-to-metadata');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

fetchMetadata.fromPeer(INFO_HASH, 'IP_ADDRESS:PORT', { timeout: 5000 }, 
  (err, metadata) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`[Callback] ${metadata.info.name.toString('utf-8')}`);
});
```
### Download directly from a peer, Promise based:
```js
const fetchMetadata = require('infohash-to-metadata');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

fetchMetadata.fromPeer(INFO_HASH, 'IP_ADDRESS:PORT', { timeout: 5000 })
.then(metadata => {
  console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
}).catch(err => {
  console.log(err);
});
```

### Download and save a .torrent file directly:
```js
const { downloadTorrent } = require('infohash-to-metadata');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

downloadTorrent(INFO_HASH, 'ubuntu-server.torrent', { maxConns: 10, fetchTimeout: 30000 })
  .then(filePath => {
    console.log(`Torrent file saved to: ${filePath}`);
  })
  .catch(err => {
    console.error('Error downloading torrent:', err);
  });
```

### Get metadata and create .torrent file:
```js
const fetchMetadata = require('infohash-to-metadata');
const { createTorrentFile } = require('infohash-to-metadata');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

// First get the metadata
fetchMetadata(INFO_HASH, { maxConns: 10, fetchTimeout: 30000 })
  .then(metadata => {
    // Then create a .torrent file from it
    return createTorrentFile(metadata, 'ubuntu-server.torrent');
  })
  .then(filePath => {
    console.log(`Torrent file saved to: ${filePath}`);
  })
  .catch(err => {
    console.error('Error:', err);
  });
```

### Get .torrent file as a buffer:
```js
const fetchMetadata = require('infohash-to-metadata');
const fs = require('fs');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

// Request the metadata with the torrent buffer included
fetchMetadata(INFO_HASH, { 
  maxConns: 10, 
  fetchTimeout: 30000,
  asTorrentBuffer: true, // Enable torrent buffer generation
  torrentMetadata: {
    createdBy: 'My Torrent App',
    comment: 'Downloaded using infohash-to-metadata',
    announce: 'http://tracker.example.com/announce'
  }
})
  .then(result => {
    // The result now includes a torrentBuffer property
    if (result.torrentBuffer) {
      // You can use this buffer directly or write it to a file
      fs.writeFileSync('ubuntu.torrent', result.torrentBuffer);
      console.log('Torrent file saved successfully!');
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });
```

