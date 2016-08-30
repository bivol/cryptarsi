/**
 * Created by delian on 8/30/16.
 */

export class UriLoad {
    req: XMLHttpRequest = null;

    constructor() {
        this.req = new XMLHttpRequest();
    }

    store(key:string, val:string) {

    }

    get(uri:string, cb: Function) {
        this.req.open('GET', file, false);
        req.send(null);
        if (req.status == 200 || req.status == 0) {
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
