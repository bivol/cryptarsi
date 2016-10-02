/**
 * Created by delian on 8/30/16.
 */

/// <reference path="./typings/index.d.ts" />

import {Config} from './Config';

export class UriLoad {
    req: XMLHttpRequest = null;

    constructor() {
        this.req = new XMLHttpRequest();
    }

    get(uri:string) {
        var me = this;
        return new Promise(function(resolve,reject) {
            me.req.open('GET', uri, true);
            me.req.onload = function(e) {
                if (me.req.readyState == 4) {
                    if (me.req.status == 200 || me.req.status == 201 || me.req.status == 0) {
                        resolve(me.req)
                    }
                }
            };
            me.req.onerror = function(e) {
                reject(me.req)
            };
            me.req.send(null);
        })
    }

/*
    get1(uri:string, cb:Function):void {
        this.req.open('GET', uri, false);
        this.req.send(null);
        if (this.req.status == 200 || this.req.status == 0) {
            return cb(null,this.req);
        } else {
            return cb(new Error('Problem'),this.req);
        }
    }

    get2(uri:string, cb: Function) {
        this.req.open('GET', uri, false);
        this.req.send(null);
        if (this.req.status == 200 || this.req.status == 0) {
            var resp = this.req.responseXML.documentElement;
            var field = resp.getElementsByTagName("data");
            for (var i=0; i<field.length;i++) {
                try {
                    var key:string = field[i].getElementsByTagName("key")[0].textContent;
                    var val:string = field[i].getElementsByTagName("value")[0].textContent;
                    this.store(key,val);
                } catch(e) {
                }
            }
        }
    }
*/
}
