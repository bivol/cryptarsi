/**
 * Created by delian on 8/19/16.
 */
"use strict";
var UriLoad_1 = require('./UriLoad');
var WordHash_1 = require('./WordHash');
var net = new UriLoad_1.UriLoad();
var wh = new WordHash_1.WordHash('', ''); // TODO: Password storage should be implemented
var Storage = (function () {
    function Storage() {
    }
    Storage.prototype.clear = function () {
        localStorage.clear();
    };
    Storage.prototype.loadFromURI = function (uri) {
        this.clear();
    };
    Storage.prototype.getData = function (key) {
        return localStorage[key];
    };
    Storage.prototype.setData = function (key, val) {
        localStorage[key] = val;
        return val;
    };
    Storage.prototype.lstr = function (x, cb) {
        var my = this;
        if (this.getData(x))
            return true;
        var file = wh.s2h(x);
        var dir = file.substr(-3, 3);
        var fn = "index/" + dir + "/file" + file + ".txt";
        net.get(fn, function (err, req) {
            var z = req.responseText;
            my.setData(x, z.replace(/\<xml\>/, "").replace(/\<\/xml\>/, ""));
            if (my.getData(x))
                return cb(null);
            return cb(new Error());
        });
        return false;
    };
    return Storage;
}());
exports.Storage = Storage;
