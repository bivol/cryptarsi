/// <sreference path="../../typings/index.d.ts"/>
import { log } from '../log';
import * as CryptoJS from 'crypto-js';
import { Config } from './Config';

export class Crypto {

    private hashSuffix = Config.cryptoHashSuffix;
    private indexSuffix = Config.cryptoIndexSuffix;

    constructor(private password: string) {
    }

    decrypt(data: string): string {
        return CryptoJS.AES.decrypt(data, this.password).toString(CryptoJS.enc.Utf8);
    }

    encrypt(data: string): string {
        //log('Encrypt data', data);
        return CryptoJS.AES.encrypt(data, this.password).toString();
    }

    buildKey(password: string): any {
        return CryptoJS.PBKDF2(password, password, {
            keySize: Config.cryptoAesKeySize
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
        log('Hash is', hash, o, CryptoJS.AES.encrypt(hash + this.hashSuffix, o.key, o).toString());
        return CryptoJS.AES.encrypt(hash + this.hashSuffix,
            o.key, o).toString();
    }
}
