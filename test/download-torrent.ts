import { downloadTorrent } from '../index';

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';

// Download the torrent file
downloadTorrent(INFO_HASH, 'ubuntu-server.torrent', { maxConns: 100, fetchTimeout: 30000, socketTimeout: 5000 })
  .then(filePath => {
    console.log(`Torrent file downloaded successfully to: ${filePath}`);
  })
  .catch(err => {
    console.error('Error downloading torrent:', err);
  }); 