/**
 * Created by delian on 8/30/16.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Crypto_1 = require('./Crypto');
var WordHash = (function (_super) {
    __extends(WordHash, _super);
    function WordHash() {
        _super.apply(this, arguments);
    }
    WordHash.prototype.hash = function (word) {
        return word.toLowerCase().match(/^.{2,15}/)[0];
    };
    WordHash.prototype.d2h = function (d) {
        return d.toString(16);
    };
    WordHash.prototype.h2d = function (h) {
        return parseInt(h, 16);
    };
    WordHash.prototype.s2h = function (s) {
        var cr = "";
        for (var i = 0; i < s.length; i++)
            cr = cr + this.d2h(s.charCodeAt(i));
        return cr;
    };
    return WordHash;
}(Crypto_1.Crypto));
exports.WordHash = WordHash;
