/**
 * Created by delian on 10/2/16.
 */

import {UriLoad} from './UriLoad';
import {Storage} from './Storage';

class LoadDB {
    uriReq: UriLoad;
    storage: Storage;

    constructor() {
        this.uriReq = new UriLoad();
        this.storage = new Storage();
    }

    load(uri:string):void {
        var me = this;
        return new Promise(function(resolve, reject) {
            me.uriReq.get(uri).then(function(req) {
                var resp = req.responseXML.documentElement;
                var field = resp.getElementsByTagName("data");
                for (var i=0; i<field.length; i++) {
                    try {
                        var key: string = field[i].getElementsByTagName("key")[0].textContent;
                        var val: string = field[i].getElementsByTagName("value")[0].textContent;
                        me.storage.setData(key, val);
                    } catch(e) { }
                }
                return resolve();
            }).catch(reject);
        });
    }
}