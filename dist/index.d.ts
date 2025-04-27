import metadata from "./lib/fetch-metadata-from-swarm";
import { default as fromPeer } from './lib/fetch-metadata-from-peer';
import { createTorrentFile, downloadTorrent, createTorrentBuffer } from './lib/create-torrent-file';
export default metadata;
export { fromPeer, createTorrentFile, downloadTorrent, createTorrentBuffer };
