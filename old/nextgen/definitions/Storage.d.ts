export declare class Storage {
    constructor();
    clear(): void;
    loadFromURI(uri: any): void;
    getData(key: string): string;
    setData(key: string, val: string): string;
    lstr(x: string, cb: Function): boolean;
}
