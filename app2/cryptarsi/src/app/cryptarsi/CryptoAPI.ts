/// <reference path="../../typings/index.d.ts"/>

import * as CryptoJS from 'crypto-js';

export class Crypto {

    private hashSuffix = '.hash';
    private indexSuffix = '.idx';

    constructor(private password: string) {
    }

    decrypt(data: string): string {
        return CryptoJS.AES.decrypt(data, this.password).toString(CryptoJS.enc.Utf8);
    }

    encrypt(data: string): string {
        //console.log('Encrypt data', data);
        return CryptoJS.AES.encrypt(data, this.password).toString();
    }

    buildKey(password: string): any {
        return CryptoJS.PBKDF2(password, password, {
            keySize: 256 / 32
        });
    }

    buildKeyIv(key): any {
        let iv = this.buildKey(key);
        let o = {
            key: iv,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        };
        return o;
    }

    encryptIndex(index: number): string {
        let o = this.buildKeyIv(index.toString() + this.indexSuffix);
        return CryptoJS.AES.encrypt(index.toString() + this.indexSuffix,
            o.key, o).toString();
    }

    encryptHash(hash: string): string {
        let o = this.buildKeyIv(hash + this.hashSuffix);
        console.log('Hash is', hash, o);
        return CryptoJS.AES.encrypt(hash + this.hashSuffix,
            o.key, o).toString();
    }
}
