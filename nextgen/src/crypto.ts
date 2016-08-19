/**
 * Created by delian on 8/19/16.
 */
/// <reference path="./typings/globals/index.d.ts" />

export class Crypto {
    password: string;

    constructor(password: string) {
        this.password = password;
    }

    decrypt(data: string): string {
        return "";
    }
}