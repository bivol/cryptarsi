/**
 * Created by delian on 8/30/16.
 */

/*
 * This little module should implement Base64 encoding/decoding with auto detect between nodejs and browser
 */

// <reference path="./typings/index.d.ts" />

var B2A = function(b:string): string {
    return new Buffer(b).toString('base64');
};
if (typeof btoa == 'function') B2A = btoa;

var A2B = function(a:string): string {
    return new Buffer(a,'base64').toString('ascii');
};
if (typeof atob == 'function') A2B = atob;

export class Base64 {
    static btoa(b:string):string {
        return B2A(b);
    }
    static atob(a:string):string {
        return A2B(a);
    }
}