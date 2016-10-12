/**
 * Created by delian on 8/19/16.
 */

/// <reference path="./typings/index.d.ts" />

import {UriLoad} from './UriLoad';
import {WordHash} from './WordHash';
import {Crypto} from './Crypto';
import {Promise} from 'es6-promise';

export class Storage {

    net: UriLoad;
    crypto: Crypto;

    constructor() {
        this.net = new UriLoad();
        this.crypto = new Crypto('',''); // TODO: Fix the password
    }

    clear() {
        localStorage.clear();
    }

    loadFromURI(uri) {
        this.clear();
    }

    getDataLS(key:string): string {
        return localStorage[key];
    }

    setDataLS(key:string, val:string):string {
        localStorage[key]=val;
        return val;
    }

    getData(key:string):Promise<any> {
        var me = this;
        return new Promise((resolve, reject) => {
            resolve(me.getDataLS(key));
        });
    }

    setData(key:string, val:string):Promise<any> {
        var me = this;
        return new Promise((resolve, reject) => {
            resolve(me.setDataLS(key,val));
        });
    }

    lstr(x: string, cb: Function):boolean { // TODO: lstr must become with callback
        var my = this;
        if (this.getData(x)) return true;
        var file = WordHash.s2h(x);
        var dir = file.substr(-3, 3);
        var fn = "index/" + dir + "/file" + file + ".txt";
        net.get(fn,function(err,req) {
            var z = req.responseText;
            my.setData(x,z.replace(/\<xml\>/, "").replace(/\<\/xml\>/, ""));
            if (my.getData(x)) return cb(null);
            return cb(new Error());
        });
        return false;
    }

    setextr(w: string, cb:Function):void {
        var d = crypto.dhs(w + ".idx");
        this.lstr(d,function(err,data) {
            if (err) cb(err,[]);
            var s = crypto.decrypt(this.getData(d)); // TODO: Storage has to become async
            return cb(null,s.split(","));
        });
    }

}
