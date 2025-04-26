import fetchMetadata from '../index';
import fs from 'fs';

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';

// Example: Get metadata with torrent buffer
fetchMetadata(INFO_HASH, {
  maxConns: 100,
  fetchTimeout: 30000,
  socketTimeout: 5000,
  asTorrentBuffer: true // Enable torrent buffer generation
})
  .then(result => {
    // Access name using type assertion since we know the structure
    const metadata = result as any;
    console.log('Metadata received:', metadata.info?.name?.toString() || 'Unknown');

    // Check if torrent buffer was generated
    if (result.torrentBuffer) {
      console.log(`Torrent buffer size: ${result.torrentBuffer.length} bytes`);

      // Write buffer to file to demonstrate it works
      fs.writeFileSync('from-buffer.torrent', result.torrentBuffer);
      console.log('Torrent buffer saved to: from-buffer.torrent');
    } else {
      console.log('No torrent buffer was generated');
    }
  })
  .catch(err => {
    console.error('Error:', err);
  }); 