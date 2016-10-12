/**
 * Created by delian on 10/2/16.
 */

/// <reference path="./typings/index.d.ts" />


/*
This class has a goal to load the database in the storage
 */

// TODO: make the code more sequential with Promises. Could use Promises.all

import {UriLoad} from './UriLoad';
import {Storage} from './Storage';
import {Promise} from 'es6-promise';

class LoadDB {
    uriReq: UriLoad;
    storage: Storage;

    constructor() {
        this.uriReq = new UriLoad();
        this.storage = new Storage();
    }

    /**
     * Loads data from a predefined URL and stores it in the storage
     * @param uri
     * @returns {"es6-promise".Promise}
     */
    load(uri:string):Promise<any> {
        var me = this;
        return new Promise(function(resolve, reject) {
            me.uriReq.get(uri).then(function(req) {
                var resp = req.responseXML.documentElement;
                var field = resp.getElementsByTagName("data");
                for (var i=0; i<field.length; i++) {
                    try {
                        var key: string = field[i].getElementsByTagName("key")[0].textContent;
                        var val: string = field[i].getElementsByTagName("value")[0].textContent;
                        me.storage.setData(key, val).catch(reject); // No problem it could execute out of order
                    } catch(e) { }
                }
                return resolve();
            }).catch(reject);
        });
    }
}