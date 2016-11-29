/**
 * Created by delian on 8/30/16.
 */
"use strict";
var UriLoad = (function () {
    function UriLoad() {
        this.req = null;
        this.req = new XMLHttpRequest();
    }
    UriLoad.prototype.get = function (uri, cb) {
        this.req.open('GET', uri, false);
        this.req.send(null);
        if (this.req.status == 200 || this.req.status == 0) {
            return cb(null, this.req);
        }
        else {
            return cb(new Error('Problem'), this.req);
        }
    };
    UriLoad.prototype.get = function (uri, cb) {
        this.req.open('GET', uri, false);
        this.req.send(null);
        if (this.req.status == 200 || this.req.status == 0) {
            var resp = this.req.responseXML.documentElement;
            var field = resp.getElementsByTagName("data");
            for (var i = 0; i < field.length; i++) {
                try {
                    var key = field[i].getElementsByTagName("key")[0].textContent;
                    var val = field[i].getElementsByTagName("value")[0].textContent;
                    this.store(key, val);
                }
                catch (e) {
                }
            }
        }
    };
    return UriLoad;
}());
exports.UriLoad = UriLoad;
