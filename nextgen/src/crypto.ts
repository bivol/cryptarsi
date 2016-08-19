/**
 * Created by delian on 8/19/16.
 */
import * as AES from "../js/libs/bower/crypto-js/aes.js";

export class Crypto {
    password: string;

    constructor(password: string) {
        this.password = password;
    }

    decrypt(data: string): string {
        return ""
    }
}