/**
 * Created by delian on 8/30/16.
 */
"use strict";
var config = require('./config.json');
var Config = (function () {
    function Config() {
    }
    Config.get = function (key) {
        return config[key];
    };
    return Config;
}());
exports.Config = Config;
