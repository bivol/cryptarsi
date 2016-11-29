/**
 * Created by delian on 8/30/16.
 */

/// <reference path="./typings/index.d.ts" />

import {Config} from './Config';
import {Promise} from 'es6-promise';

export class UriLoad {
    req: XMLHttpRequest = null;

    constructor() {
        this.req = new XMLHttpRequest();
    }

    get(uri:string):Promise<any> {
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
}
