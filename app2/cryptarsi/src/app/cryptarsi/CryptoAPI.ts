/// <reference path="../../typings/index.d.ts"/>

import * as CryptoJS from 'crypto-js';

export class Crypto {
    constructor(private password: string) {
    }

    decrypt(data: string): string {
        return CryptoJS.AES.decrypt(data, this.password).toString(CryptoJS.enc.Utf8);
    }

    encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.password).toString();
    }
}
