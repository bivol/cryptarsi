/**
 * Created by delian on 8/19/16.
 */
/// <reference path="./typings/index.d.ts" />

var gPassword:string = null;
var gNonce:string = null;

// TODO: To implement the Nonce

export class Crypto {

    constructor(password: string, nonce: string) {
        gPassword = password;
    }

    decrypt(data: string, password:string = gPassword, nonce:string = gNonce): string {
        return CryptoJS.AES.decrypt(data, password).toString();
    }

    encrypt(data: string, password:string = gPassword, nonce:string = gNonce): string {
        return CryptoJS.AES.encrypt(data, password).toString();
    }

    setPassword(password:string) {
        gPassword = password;
    }

    setNonce(nonce:string) {
        gNonce = nonce;
    }

    dhs(word: string): string {
        return this.encrypt(word);
    }
}

