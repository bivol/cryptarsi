/**
 * Created by delian on 8/19/16.
 */
/// <reference path="./typings/index.d.ts" />
"use strict";
var gPassword = null;
var gNonce = null;
// TODO: To implement the Nonce
var Crypto = (function () {
    function Crypto(password, nonce) {
        gPassword = password;
    }
    Crypto.prototype.decrypt = function (data, password, nonce) {
        if (password === void 0) { password = gPassword; }
        if (nonce === void 0) { nonce = gNonce; }
        return CryptoJS.AES.decrypt(data, password).toString();
    };
    Crypto.prototype.encrypt = function (data, password, nonce) {
        if (password === void 0) { password = gPassword; }
        if (nonce === void 0) { nonce = gNonce; }
        return CryptoJS.AES.encrypt(data, password).toString();
    };
    Crypto.prototype.setPassword = function (password) {
        gPassword = password;
    };
    Crypto.prototype.setNonce = function (nonce) {
        gNonce = nonce;
    };
    Crypto.prototype.dhs = function (word) {
        return this.encrypt(word);
    };
    return Crypto;
}());
exports.Crypto = Crypto;
