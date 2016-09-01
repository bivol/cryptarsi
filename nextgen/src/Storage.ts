/**
 * Created by delian on 8/19/16.
 */

import {UriLoad} from './UriLoad';
import {WordHash} from './WordHash';

var net = new UriLoad();
var wh = new WordHash('',''); // TODO: Password storage should be implemented

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

    lstr(x: string, cb: Function):void {
        var my = this;
        if (this.getData(x)) return 1;
        var file = wh.s2h(x);
        var dir = file.substr(-3, 3);
        var fn = "index/" + dir + "/file" + file + ".txt";
        net.get(fn,function(err,req) {
            var z = req.responseText;
            my.setData(x,z.replace(/\<xml\>/, "").replace(/\<\/xml\>/, ""));
            if (my.getData(x)) return cb(null);
            return cb(new Error());
        });
    }
}
