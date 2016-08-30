/**
 * Created by delian on 8/30/16.
 */

declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

var config = require('./config.json');

export class Config {
    constructor() {

    }

    static get(key:string):string {
        return config[key];
    }
}