/**
 * Created by delian on 8/19/16.
 */
/// <reference path="./typings/index.d.ts" />

export class Crypto {
    password: string;
    nonce: string;

    constructor(password: string, nonce: string) {
        this.password = password;
    }

    decrypt(data: string, password = this.password, nonce = this.nonce): string {
        return CryptoJS.AES.decrypt(data, this.password).toString();
    }

    encrypt(data: string, password = this.password, nonce = this.nonce): string {
        return CryptoJS.AES.encrypt(data, this.password).toString();
    }

    dhs(word: string): string {
        return this.encrypt(word);
    }
}

