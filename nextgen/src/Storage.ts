/**
 * Created by delian on 8/19/16.
 */

import {UriLoad} from './UriLoad';
import {WordHash} from './WordHash';
import {Crypto} from './Crypto';

var net = new UriLoad();
var crypto = new Crypto('',''); // TODO: Password

export class Storage {
    constructor() {
    }

    clear() {
        localStorage.clear();
    }

    loadFromURI(uri) {
        this.clear();
    }

    getData(key:string): string {
        return localStorage[key];
    }

    setData(key:string, val:string):string {
        localStorage[key]=val;
        return val;
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
