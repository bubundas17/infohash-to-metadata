interface Options {
    [key: string]: any;
}
type CallbackFunction = (error: Error | null, metadata?: any) => void;
export declare function validateArgs(infohash: string, opts: Options | undefined, callbackFn: CallbackFunction | undefined): void;
export {};
