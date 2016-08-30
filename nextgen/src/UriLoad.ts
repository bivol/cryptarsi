/**
 * Created by delian on 8/30/16.
 */

import {Config} from './Config';

export class UriLoad {
    req: XMLHttpRequest = null;

    constructor() {
        this.req = new XMLHttpRequest();
    }

    store(key:string, val:string) {
        localStorage[key]=val;
    }

    get(uri:string, cb: Function) {
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
}
