/**
 * Created by delian on 8/19/16.
 */
/// <reference path="./typings/index.d.ts" />

export class Crypto {
    password: string;

    constructor(password: string) {
        this.password = password;
    }

    decrypt(data: string): string {
        return CryptoJS.AES.decrypt(data, this.password).toString();
    }

    encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.password).toString();
    }
}