/**
 * Created by delian on 8/30/16.
 */
"use strict";
/*
 * This little module should implement Base64 encoding/decoding with auto detect between nodejs and browser
 */
// <reference path="./typings/index.d.ts" />
var B2A = function (b) {
    return new Buffer(b).toString('base64');
};
if (typeof btoa == 'function')
    B2A = btoa;
var A2B = function (a) {
    return new Buffer(a, 'base64').toString('ascii');
};
if (typeof atob == 'function')
    A2B = atob;
var Base64 = (function () {
    function Base64() {
    }
    Base64.btoa = function (b) {
        return B2A(b);
    };
    Base64.atob = function (a) {
        return A2B(a);
    };
    return Base64;
}());
exports.Base64 = Base64;
