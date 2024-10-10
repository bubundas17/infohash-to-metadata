"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discover_1 = __importDefault(require("./discover"));
const utils = __importStar(require("./utils"));
const defaults = __importStar(require("./defaults"));
const fetchMetadataFromSwarm = (infohash, opts = {}, callbackFn) => {
    utils.validateArgs(infohash, opts, callbackFn);
    const options = {
        maxConns: defaults.DEFAULT_MAX_CONNS,
        fetchTimeout: defaults.DEFAULT_FETCH_TIMEOUT,
        socketTimeout: defaults.DEFAULT_SOCKET_TIMEOUT,
        dht: true,
        ...opts
    };
    return new Promise((resolve, reject) => {
        const discovery = (0, discover_1.default)(infohash, options);
        let timeoutHandle;
        discovery.on('_bmd_metadata', (metadata) => {
            clearTimeout(timeoutHandle);
            if (callbackFn) {
                callbackFn(null, metadata);
            }
            resolve(metadata);
        });
        discovery.on('error', (err) => {
            discovery.destroy();
            clearTimeout(timeoutHandle);
            if (callbackFn) {
                callbackFn(err);
            }
            reject(err);
        });
        timeoutHandle = setTimeout(() => {
            const err = new Error(`fetchMetadataFromSwarm timeout after ${options.fetchTimeout}ms`);
            discovery.emit('error', err);
        }, options.fetchTimeout);
    });
};
exports.default = fetchMetadataFromSwarm;
