/*
 Copyright (c) 2011-2012, Delian Delchev & Atanas Tchobanov
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of Delian Delchev & Atanas Tchobanov nor the
 names of its contributors may be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 This software is using code from the following projects:

 - AES implementation in JavaScript (c) Chris Veness 2005-2011
 see http://csrc.nist.gov/publications/PubsFIPS.html#197
 http://www.movable-type.co.uk/scripts/aes.html

 - Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple single-byte character encoding (c) Chris Veness 2002-2011

 - PDF.js Copyright (c) 2011 Mozilla Foundation
 https://github.com/mozilla/pdf.js
 Contributors: Andreas Gal
 Chris G Jones
 Shaon Barman
 Vivien Nicolas
 Justin D'Arcangelo
 Yury Delendik
 Kalervo Kujala
 Adil Allawi
 Jakob Miland
 Artur Adib
 Brendan Dahl

 - Base64Binary Copyright (c) 2011, Daniel Guerrero
 */


var user;
var pass;
var nonce;
var pass2;
var baski = new Object();
var basket = new Object();
var publi = new Object();
var editpng = "iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAA3NCSVQICAjb4U/gAAABUFBMVEX////3///39//v9///7+/37+/v7/fn7/fe7///573n5/fv5+fe5+/W5/f33sb/3qX33r3e3u/W3uf/1pzv1r3e1t7W1t7O1uf/1kLO1t7/zozG1t73zoT/zlLOzt7Oztb/zjnGzt7Gztb/ziH/zhD/xlLGxta9xt69xtb/xhC9xsa9xs7/xgDWvbX3vTH3vSG1vb21vcb/tSnOta3Gtb3/tQj/tQD3tRC9tb2ttbX/rRittb3erVq9ra29rbWtrb2lrb3/pQClrbWtpaWlpbX/nAicpaW1nJz3lCmcnK2UnK2UnKX/jAj/jAD3hDnWhFLGhHu9hITGhGvehBj3exi9hGOEjKV7jKW1e3PeczGEhIx7hJSce4R7hIz/awCtc2PWayl7e4x7e4Slc1pze3u9azn/WgDvWghrc3vGWjFra3vnQgDeQgCtSimEUkL/AP/EQcPCAAAAcHRSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8At2Fi0gAAAAlwSFlzAAAK8AAACvABQqw0mAAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTM5jWRgMAAAAsdEVYdENyZWF0aW9uIFRpbWUARnJpIDIzIEp1bCAyMDA0IDIwOjE0OjA0IC0wMDAw128ueAAAAM9JREFUGJVjyMcADFiF1CSBQFHDOdg/3gIqJMYABIzMNjpGfhFQIUmQEAO3uWNcjjuKkIyZb1pumCGSEIu+mW92TLg3khC/mWNcproXspCejmt6IC+yEKemqU+CHI9DVL42TEhVxSokgIPLIUXbUgvsLkY+BWWjSFFBIc8MLUtriJCArIRHkLiamneGlrUBREhEWCrVTlpD0jtDWwvqId3kUFtJJQ1JlyS4H43zTITkJcXYnbzhQqysjExsTMxM9lAh68TY2OjYRBDIcgMKAQCzJVHpRUMajAAAAABJRU5ErkJggg==";
var tickpng = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAA3NCSVQICAjb4U/gAAAAqFBMVEVMnwm71qWDwFLU1NSfv4RjsyDC8J3l5eWs537FxsVWswySz2De7tBrtS/h79VXrBHS6cDq99+y1pahz31fwRCGuV3MzMxnuyTN5riM11BQpgrv+uXF3bFcwQx2tkLQ4cPc3Nzv7++ZyXK56pFbtRKIvlxUrwqBxkmo14PB36ni9dNcrxmU1lL1+fFXtwtsxSW/0rDf98xwuDXV8b6mzoRhwhNUpRKLwGDgG7+sAAAAOHRSTlP///////////////////////////////////////////////////////////8A/////////////wxlbe0AAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAfdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIDi1aNJ4AAAAf0lEQVQYlWPQRQMMaHxDNAFlNlQBYxVpFAEtbW4UMwRZzQSRBfhYGTRAtghIQ/gS2lJGYGs1eflAfGE1NX4eiDu0uZhMlFj19PSEoA6TERcXAQJ9VbhLGdV1JCUl5ZCcLm/OwcHEh+wXRRZRA4TnFNkVmMU4OcWYFdgVMX2rCwCUkSbn8tcLPAAAAABJRU5ErkJggg==";
var publishxpng = "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAALHRFWHRDcmVhdGlvbiBUaW1lAEZyaSAyNiBTZXAgMjAwMyAwODo0MTo0MCAtMDAwMGcWLAkAAAAHdElNRQfTCRoHKh1j6KffAAAACXBIWXMAAAsSAAALEgHS3X78AAAABGdBTUEAALGPC/xhBQAAAHhQTFRF////xs7Oxq21vXt7xr29xq2tzlpC3ikIxlpSxrW1xkpS3gAAxoR75zkI/0oQxlJS/wAA70IQxkJC7wgA7yEA/yEA5wAAzlJC70oY/2Mhxr21zmtS72Mp/3s51mta73M5/5xa1ox773Mx/7Vz5ykIxrWt3nta1mtSK1AQzwAAAAF0Uk5TAEDm2GYAAAB7SURBVHjaJY7tFoIgEEQHWYgPESMrUousrPd/wxbdXzPn3LlnIdaFwEetEli/5TcC1gStsLzeZSIyOX8k6FGes74euxAZH6f5njk7u011vnUhbRoQM92wF2uYGc6XyBjVnNKp9yxoQ/VQ9L2XUPpgKuC8UxCN3N+RjfgDbwsGzDrn/yYAAAAASUVORK5CYII=";
var ajaxloader = "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";
var picturepng = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGYUExURZas0JWr0O/z9+bu9sfS45+75+fu9pqw0puw0PD0+NGfVNOfVOzz952y0Ze14+jw9mOWPJ6y0uvv8ovCWYG+Uu3x9+zx9+3v8e7z94aORPH0+Hqf1/Dz95jJZYip3ZKz0KHMk47CcYGk2p255oe7YYu7g3Odw4C2o6rRhIfAVuvy95HGXe/094q9ZXqqTufv9Xq6T4eLQai408nInO/z+MvV5GmemvL193ura46u4HyweH+zoajSdJWrz5mv0MXTr8PZuqfQgpSrz4e3uOnv8ous3vD093iqn+3y95DFXmWYPp6y0YKmx+bt9snU5GqWo/D195O20ZTCi32i2fP09IC+U4fBWIeyb/Lz9Jm35KK104C1qZfIY2STka+GP5vLZ4/FY6DNfX+9WI200KbQgunw9+vs7JW044e9bO3x9vHz95PCiHSmSn68UneoTNGvbpp7NWeaQJu45X2ixV+SjObt92qZpYeztoCDVqG96LLB2qe503ed1naCXqHLk5jJal6QiYSn3Jqw0ZWs0PT195mv0cLcv////9erUeAAAACIdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAYt9YPAAAAx0lEQVR42mJoRwMM7aZGHM0gwAgEdixAgeq0kBYo4HHxBgpwRKQnRytopASZqdVosQMFGFr4nOts4mPqVcukU8EC5pHqjrLawmGKJcH8TSCBgCLrRE9NkdyMBiV9sICOcnl2QqhBkpV/IxtYQII10D1cV8UitlgOLNDsUckqXytpWOFj6coMFhDTy8sp4OaKK/QSAAs4iba1tdkb5zsAKd9WoIBtZhsclIIEosSzpDjdZJiAwERIECjgV9XUCgO8IM+hAYAAAwD8SFpupCeivAAAAABJRU5ErkJggg==";
var audiopng = "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOBAMAAADtZjDiAAAAL3RFWHRDcmVhdGlvbiBUaW1lAGpldS4gMTYgamFudi4gMjAwMyAxMzowNjoxOCArMDEwMMvW/rYAAAAHdElNRQfTARAMBykx7k3BAAAACXBIWXMAABGvAAARrwH3/UuEAAAABGdBTUEAALGPC/xhBQAAADBQTFRF////9/f/5+f/Xl56UFDDV1fx5uZzr69TFhZ79/djoqK34uJe5+dS//+MBQUNnp7uspz8egAAAAF0Uk5TAEDm2GYAAABbSURBVHjaY2BgYGAKFWAAga/THMD0r51gmt89u16QgWGVhfvpqwoMXO9egGlm8+b201MFGdjfPWnfM1WBQQoqDlTnDaYZmNorS0H6hcLTIOappgWAKEYhEwYGAKeMHVkYe3D1AAAAAElFTkSuQmCC";

var pdfpng = "R0lGODlhEgASANUAAHEVDenS16qChv/9/t3W3vcAAP/X2P/l5PXs7rlkZt6IiPvKy/Pv8MnFzf/09bRVWfssL+/v8trY3NvX4DcqAOkCAkEzA/+mp8BhYh0QALdKVHl2etMBBF8aHzIwM+/v7f4QDvX2+MmztP8dKHwxALm2vf/n6v7q7Ojh4OO6wlEhIW8rKv/3+Nq+vcpeXvOHhyITAI2LjqhlaPoQG7qYmvLt8////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAASABIAQAa2QJtwSCwabbeahHDAHBAISSOSKd4sWIqFQsl4MzChBjICFc4VDmAzGNg8xpvtkGihQjZEQ3CoEmM1gYIbEnBEJAAAHYsdiSonDQ0lDX5DSQwsCgsvFyYGASaVQjcCNCwfEUsEBA0TojYxsbKyRxq2t7YrbAMWRGMzZmhqG8TEvURJghiBExOtr0kENQsPIiwIqVRWNQwoGBcXLgkyNAPQNQkK1xERDAEpC9AODgeoEausrkf7REEAOw==";

//Object keys emulator for Firefox < 4.x

if (typeof JSON == 'undefined') {
    JSON = {};

    JSON.stringify = function (ref) {
        var s = '';
        Traverse(ref).forEach(function to_s(node) {
            if (node instanceof Array) {
                this.before(function () {
                    s += '['
                });
                this.post(function (child) {
                    if (!child.isLast) s += ',';
                });
                this.after(function () {
                    s += ']'
                });
            }
            else if (typeof node == 'object') {
                this.before(function () {
                    s += '{'
                });
                this.pre(function (x, key) {
                    to_s(key);
                    s += ':';
                });
                this.post(function (child) {
                    if (!child.isLast) s += ',';
                });
                this.after(function () {
                    s += '}'
                });
            }
            else if (typeof node == 'string') {
                s += '"' + node.toString().replace(/"/g, '\\"') + '"';
            }
            else if (typeof node == 'function') {
                s += 'null';
            }
            else {
                s += node.toString();
            }
        });
        return s;
    };

    JSON.parse = function (s) {
        return eval('(' + s + ')'); // meh, I'm lazy
    };
}

if (!Object.keys) Object.keys = function (obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            keys.push(key);
    }
    return keys;
};

if (typeof Object.create === 'undefined') {
    Object.create = function (o) {
        function F() {
        }

        F.prototype = o;
        return new F();
    };
}

if (!Array.prototype.forEach) Array.prototype.forEach = function (f, to) {
    for (var i = 0; i < this.length; i++) {
        f.call(to, this[i], i, this);
    }
};

if (!Array.isArray) Array.isArray = function (ref) {
    return Object.prototype.toString.call(ref) === '[object Array]';
};

if (!Array.prototype.some) Array.prototype.some = function (f, to) {
    for (var i = 0; i < this.length; i++) {
        if (f.call(to, this[i], i, this)) return true;
    }
    return false;
};

if (!Array.prototype.every) Array.prototype.every = function (f, to) {
    for (var i = 0; i < this.length; i++) {
        if (!f.call(to, this[i], i, this)) return false;
    }
    return true;
};

if (!Array.prototype.indexOf) Array.prototype.indexOf = function (x) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === x) return i;
    }
    return -1;
};

//End object.keys emulator for Firefox < 4.x

function checkuser() {

    var f = document.getElementById("author");

    // Check is the user/pass correct
    user = f.name.value;
    pass = f.pass.value;
    var ubase = btoa(user);

    if (!lstr(ubase)) return 0;

    var s = localStorage[ubase];
    var x = atob(s);
    var d = Aes.Ctr.decrypt(s, pass, 256);
    pass2 = pass + user;
    pass2 = pass2.substr(0, 32);

    nonce = x.substr(0, 8);

    return (d == user) ? 1 : 0;
}

function validate() {
    var e = document.getElementById("mylogin");
    e.style.display = "none";
    //	if (localStorage["wiki_status"] !== "OK")
    //		e=document.getElementById("reload");
    //	else {
    if (checkuser())
        e = document.getElementById("search")
    else
        e = document.getElementById("mylogin");
    //	}
    e.style.display = "block";
}

function reldb() {
    var e;
    e = document.getElementById("search");
    e.style.display = "none";
    e = document.getElementById("mylogin");
    e.style.display = "block";
    //	e=document.getElementById("reload");e.style.display="none";
}

function cledb() {
    localStorage.clear();
    return reldb();
}

function reloaddata() {
    var e = document.getElementById("dbname");
    var dbname = e.dbd.options[e.dbd.selectedIndex].value;
    e = document.getElementById("jurkane");
    e.innerHTML = "<H1>Please wait until the database is loaded</H1>";
    localStorage.clear();
    if (reloadb(dbname)) {
        localStorage["wiki_status"] = "OK";
        e.innerHTML = "";

        e = document.getElementById("reload");
        e.style.display = "none";
        e = document.getElementById("search");
        e.style.display = "block";

        // Lets check for the users
        if (checkuser() == 0) {
            e.style.display = "none";
            e = document.getElementById("mylogin");
            e.style.display = "block";
        }

    } else {
        localStorage.clear();
        e.innerHTML = "";
        e = document.getElementById("reload");
        e.style.display = "none";
        e = document.getElementById("error");
        e.style.display = "block";
    }
}

function reloadb(file) {
    localStorage.clear(); // Clear the whole local storage
    var req = new XMLHttpRequest();
    req.open('GET', file, false);
    req.send(null);
    if (req.status == 200 || req.status == 0) {
        var x = req.responseXML.documentElement;

        // Read the files
        var f = x.getElementsByTagName("data");
        var i;
        for (i = 0; i < f.length; i++) {
            // xxx
            try {
                var mykey = f[i].getElementsByTagName("key")[0].textContent;
                var myval = f[i].getElementsByTagName("value")[0].textContent;
                localStorage[mykey] = myval;
            } catch (e) {
            }
            ;
        }
        return 1;
    }
    return 0;
}

//Import data functions
function showimport() {
    var x = document.getElementById("import");
    x.style.display = "block";
}

function loadimport() {
    var x = document.getElementById("vimport");
    var y = document.getElementById("bimport");
    // Read the values
    var f = x.value.getElementsByTagName("data");
    var b = y.value;
    var i;
    for (i = 0; i < f.length; i++) {
        // xxx
        try {
            var mykey = f[i].getElementsByTagName("key")[0].textContent;
            var myval = f[i].getElementsByTagName("value")[0].textContent;
            localStorage[mykey] = myval;

        } catch (e) {
        }
        ;
    }
    var i = document.getElementById("import");
    i.innerHTML = "Imported " + f.lenght + " records";
    return 1;
}


//End import functions

function init() {

    // test for storage object
    if (localStorage == undefined) {
        var e = document.getElementById("nohtml5");
        e.style.display = "block";
    } else {
        // Request for user/pass
        var e = document.getElementById("mylogin");
        e.style.display = "block";
        loadbasket();
    }

}

function dhs(w) {
    return Aes.Ctr.encrypt(w, pass2, 256, nonce);
}

function myhash(w) {

    return w.toLowerCase().match(/^.{2,15}/)[0];
    //return  w.toLowerCase().match(/^(\w|[\x80-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}){2,15}/)[0];
}

function crossset(w, s) {
    var a = Array();
    for (var i = 0; i < s.length; i++) // xxx
        for (var j = 0; j < w.length; j++) // xxx
            if (w[j] == s[i]) a.push(w[j]);
    return a;
}

function setextr(w) {
    var d = dhs(w + ".idx");
    if (lstr(d)) {
        var s = Aes.Ctr.decrypt(localStorage[d], pass2, 256);
        return s.split(",")
    }
    else
        return Array();
}

function srch(w) {
    var i;
    var zl = w.length;
    for (i = 0; i < w.length; i++) {
        if (w[i].length < 3) {
            w.splice(i--, 1);
            continue;
        } // xxx
        w[i] = myhash(w[i]);
    }
    // if (zl>0 && w.length<1) return Array(); // xxxx
    if (w.length == 0) return setextr("");
    var myset = setextr(w[0]);
    for (i = 1; i < w.length; i++) //
        myset = crossset(myset, setextr(w[i]));
    return myset;
}

//Basket functions	
function loadbaski(b) {
    baski[b] = new Object();
    var s = new Array();
    if (localStorage['baski.' + b])
        s = localStorage['baski.' + b].split(',');
    for (var i = 0; i < s.length; i++) //
        baski[b][s[i]] = 1;
    return false;
}

function savebaski(b) {
    var s = Object.keys(baski[b]);
    localStorage['baski.' + b] = s.join(",");
    return false;
}

function checkbaski(b, id) {
    if (baski == undefined)
        loadbaski(b);
    return baski[b][id];
}

function addtobaski(b, id) {
    if (baski == undefined) loadbaski(b);
    baski[b][id] = 1;
    savebaski(b);
}

function removefrombaski(b, id) {
    if (baski == undefined) loadbaski(b);
    delete(baski[b][id]);
    savebaski(b);
}

function togglebaski(t, b, id) {
    loadbaski(b);
    if (baski[b][id]) {
        removefrombaski(b, id)
        t.innerHTML = b + ": <b><img src='data:image/png;base64," + publishxpng + "' border=0></b>";
    }
    else {
        addtobaski(b, id);
        t.innerHTML = b + ": <b><img src='data:image/png;base64," + tickpng + "' border=0></b>";
    }
    return false;
}

//Baskets names

function addbasket() {
    var e = document.getElementById("nbasket");
    var nb = e.value;
    if (baskets == undefined) loadbasket();
    baskets[nb] = 1;
    savebasket();
}

function loadbasket() {
    baskets = new Object();
    var s = new Array();
    if (localStorage['basket'])
        s = localStorage['basket'].split(',');
    for (var i = 0; i < s.length; i++) //
        baskets[s[i]] = 1;
    var e = document.getElementById("lbaskets");
    loadbaski("edited");
    loadbaski("ready");
    var output = "<span align='left'>Edited</span><span align='right'> [<a href='#' onclick='mysearch(0,20,\"edited\")'>View</a>] [<a href='#' onclick='myexport(\"edited\")'>Export</a>]</span><BR><span align='left'>Ready</span><span align='right'> [<a href='#' onclick='mysearch(0,20,\"ready\")'>View</a>] [<a href='#' onclick='myexport(\"ready\")'>Export</a>]</span>&nbsp;";
    for (property in baskets) {
        output += "<BR><span align='left'>" + property + "</span><span align='right'> [<a href='#' onclick='mysearch(0,20,\"" + property + "\")'>View</a>] [<a href='#' onclick='myexport(\"" + property + "\")'>Raw</a>] [<a href='#' onClick='removebasket(\"" + property + "\")'>Delete <img src='data:image/png;base64," + publishxpng + "' border=0></a>]&nbsp;</span>";
        loadbaski(property);
    }
    e.innerHTML = output;
    return false;
}

function savebasket() {
    var s = Object.keys(baskets);
    localStorage['basket'] = s.join(",");
    loadbasket();
    return false;
}

function removebasket(b) {
    if (baskets == undefined) loadbasket();
    delete(baskets[b]);
    savebasket();
}

// End basket functions

function showid(id) {
    var e = document.getElementById("results");
    var a = document.getElementById("attachments");
    var m = document.getElementById("media");
    m.innerHTML = "";
    if (baski["edited"][id]) {
        if (baski["ready"][id])
            var isready = " (Ready)";
        else
            var isready = " (Not Ready)";
        var s = "<a href='#' onClick='editid(" + id + ")'><img src='data:image/png;base64," + editpng + "' border=0> Edited" + isready + "</a> ::: ";
    } else {
        var s = "<a href='#' onClick='editid(" + id + ")'><img src='data:image/png;base64," + editpng + "' border=0> Edit</a> ::: ";
    }
    for (property in baskets) {
        if (baski[property][id]) {
            s += "<a name='" + id + "'><a href='#" + id + "' onClick='togglebaski(this,\"" + property + "\",\"" + id + "\")'>" + property + ": <b><img src='data:image/png;base64," + tickpng + "' border=0></b></a> ::: ";
        } else {
            s += "<a name='" + id + "'><a href='#" + id + "' onClick='togglebaski(this,\"" + property + "\",\"" + id + "\")'>" + property + ":<b><img src='data:image/png;base64," + publishxpng + "' border=0></b></a> ::: ";
        }
    }
    var ms = "";

    var ipp = trd(id + ".attachcount");
    if (ipp > 0) {
        for (ip = 1; ip < ipp; ip++) {
            if (trd(id + ".attachtype." + ip) == "pdf") { //pdf
                ms += "<A HREF='#" + id + ip + "' onClick='showpdf(\"" + id + "\",\"" + ip + "\");return false;' CLASS='" + ((localStorage["beenhere." + id + ip]) ? "been" : "notbeen") + "'><img src='data:image/gif;base64," + pdfpng + "' border=0>";
                ms += trd(id + ".attachname." + ip);
                ms += "</A><BR>";

            } else {
                ms += "<A HREF='#" + id + ip + "' onClick='document.getElementById(\"media\").innerHTML=\"\";showmedia(\"" + id + "\",\"" + ip + "\");return false;' CLASS='" + ((localStorage["beenhere." + id + ip]) ? "been" : "notbeen") + "'>";

                if (trd(id + ".attachtype." + ip) == "png" || trd(id + ".attachtype." + ip) == "jpg")
                    ms += "<img src='data:image/png;base64," + picturepng + "' border=0> ";

                if (trd(id + ".attachtype." + ip) == "mp3" || trd(id + ".attachtype." + ip) == "ogg")
                    ms += "<img src='data:image/png;base64," + audiopng + "' border=0> ";

                ms += trd(id + ".attachname." + ip);
                ms += "</A><BR>";
            } //not pdf
        }
    }
    e.innerHTML = "<H1>" + trd(id + ".subj") + "</H1><HR><B>REFID:</B> " + trd(id + ".refid")
        + " <B>DATE:</B> " + trd(id + ".date")
        + " <B>ORIGIN:</B> " + trd(id + ".origin")
        + " <B>CLASS:</B> " + trd(id + ".class")
        + " <B>DEST:</B> " + trd(id + ".dest");

    e.innerHTML += "<BR><B>TEXT:</B> <PRE>" + trd(id + ".data") + "</PRE><BR>" + s + "<HR>";

    a.innerHTML = " <BR>" + ms;

    localStorage["beenhere." + id] = 1;
    return false;
}

function showmedia(id, ip) {
    var e = document.getElementById("media");
    if (trd(id + ".attachtype." + ip) == "jpg" || trd(id + ".attachtype." + ip) == "png") {
        if (trd(id + ".attachname." + ip)) {
            e.innerHTML = "<P>" + trd(id + ".attachname." + ip) + "</P><P><img width=800 src=\"data:image/png;base64," + trdm(id + ".attachdata." + ip) + "\"><P>";
            //g.document.write('<html>' + trd(id + ".attachname." + ip) + '<P><img width="800" src="data:image/jpg;base64,' + trdm(id + ".attachdata." + ip) + '"></html>');
        } else {
            e.innerHTML = '<P>' + trd(id + ".attachname." + ip) + '<P>Can\'t be found';
        }
    }

    if (trd(id + ".attachtype." + ip) == "mp3" || trd(id + ".attachtype." + ip) == "ogg" || trd(id + ".attachtype." + ip) == "wav") {
        if (trd(id + ".attachname." + ip)) {
            if (trd(id + ".attachtype." + ip) == "ogg")
                e.innerHTML = '<P>' + trd(id + ".attachname." + ip) + '<P><audio controls="controls" autobuffer="autobuffer" autoplay="autoplay"><source src="data:audio/ogg;base64,' + trdm(id + ".attachdata." + ip) + '"/></audio>';
            if (trd(id + ".attachtype." + ip) == "mp3")
                e.innerHTML = '<P>' + trd(id + ".attachname." + ip) + '<P><audio controls="controls" autobuffer="autobuffer" autoplay="autoplay"><source src="data:audio/mpeg;base64,' + trdm(id + ".attachdata." + ip) + '"/></audio>';
        } else {
            e.innerHTML = '<P>' + trd(id + ".attachname." + ip) + '<P>Can\'t be found';
        }
    }

    localStorage["beenhere." + id + ip] = 1;
    return false;
}

function showpdf(id, ip, file) {
    if (trd(id + ".attachname." + ip)) {
        var pdfdata = trdm(id + ".attachdata." + ip);
        var databin = Base64Binary.decodeArrayBuffer(pdfdata);
        var pdf = PDFView.load(databin);
        s = document.getElementById("main");
        s.style.display = "none";
        v = document.getElementById("view");
        v.style.display = "block";
    } else {
        canvas.innerHTML = '<P>' + trd(id + ".attachname." + ip) + '<P>Can\'t be found';
    }
}

function editid(id) {
    var e = document.getElementById("results");
    if (localStorage[dhs(id + ".dataed")]) {
        var toedit = trd(id + ".dataed");
    } else {
        var toedit = trd(id + ".data");
    }

    if (baski["edited"][id]) {
        if (baski["ready"][id])
            var isready = " (Ready)";
        else
            var isready = " (Not Ready)";
        var s = "<a href='#' onClick='editid(" + id + ")'><img src='data:image/png;base64," + editpng + "' border=0> Edited" + isready + "</a> ::: ";
    } else {
        var s = "<a href='#' onClick='editid(" + id + ")'><img src='data:image/png;base64," + editpng + "' border=0> Edit</a> ::: ";
    }
    for (property in baskets) {
        if (baski[property][id]) {
            s += "<a name='" + id + "'><a href='#" + id + "' onClick='togglebaski(this,\"" + property + "\",\"" + id + "\")'>" + property + ": <b><img src='data:image/png;base64," + tickpng + "' border=0></b></a> ::: ";
        } else {
            s += "<a name='" + id + "'><a href='#" + id + "' onClick='togglebaski(this,\"" + property + "\",\"" + id + "\")'>" + property + ":<b><img src='data:image/png;base64," + publishxpng + "' border=0></b></a> ::: ";
        }
    }

    e.innerHTML = "<form><textarea cols=80 rows=100 id='editid'>" + toedit + "</textarea><BR><input type='button' value='Save' onclick='saveedited(" + id + "); return false;' > <input type='button' value='Ready' onclick='saveedited(" + id + ",1); return false;'> </FORM><BR>" + s;
    return false;
}

function saveedited(id, r) {
    var e = document.getElementById("editid").value;
    localStorage[dhs(id + ".dataed")] = dhs(e);
    addtobaski("edited", id)
    if (r) {
        addtobaski("ready", id)
        showid(id);
    } else {
        editid(id);
    }
}

//Search and show functions

function lstr(x) {
    if (localStorage[x]) return 1;
    var file = s2h(x);
    var dir = file.substr(-3, 3);
    var fn = dir + "/file" + file + ".txt";
    var r = new XMLHttpRequest();
    r.open('GET', fn, false);
    r.send(null);
    if (r.status == 0 || r.status == 200) {
        var z = r.responseText;
        localStorage[x] = z.replace(/\<xml\>/, "").replace(/\<\/xml\>/, "");
        if (localStorage[x]) return 1;
        return 0;
    } else return 0;
}

//Show text - cached in localstorage
function trd(id) {
    var xid = dhs(id);
    if (lstr(xid)) {
        var s = Aes.Ctr.decrypt(localStorage[xid], pass2, 256);
        return s.replace(/^\s+/, "").replace(/\s+$/, "");
    }
    return "";
}

// Show images and audio, not cached in localStorage

function trdm(id) {
    //var e = document.getElementById("media");
    //e.innerHTML = '<img src="data:image/gif;base64,'+ajaxloader+'">';
    var xid = dhs(id);
    var file = s2h(xid);
    var dir = file.substr(-3, 3);
    var fn = dir + "/file" + file + ".txt";
    var r = new XMLHttpRequest();
    r.open('GET', fn, false);
    r.send(null);
    if (r.status == 0 || r.status == 200) {
        var z = r.responseText;
        var zr = z.replace(/\<xml\>/, "").replace(/\<\/xml\>/, "");
        var s = Aes.Ctr.decrypt(zr, pass2, 256);
        return s.replace(/^\s+/, "").replace(/\s+$/, "");
    }
    if (r.status == 404) {
        return "Error 404 Not Found";
    }
    return "";
}

// Search function	
function mysearch(start, end, b) {

    var e = document.getElementById("srch");
    var m = document.getElementById("media");
    m.innerHTML = "";
    var a = document.getElementById("attachments");
    m.innerHTML = "";
    a.innerHTML = "";
    var sch = e.value;
    sch = sch.replace(/^\s+/, "").replace(/\s+$/, "");
    var w = sch.split(" ");
    var idx;
    if (baski == undefined) loadbaski(b);
    if (b) {
        idx = Object.keys(baski[b])  // Take the info from the basket
    } else if (sch) {
        idx = srch(w);
    } else {
        idx = "";
    }

    baskets = new Object();
    var s = new Array();
    if (localStorage['basket'])
        s = localStorage['basket'].split(',');
    for (var i = 0; i < s.length; i++) //
        baskets[s[i]] = 1;


    e = document.getElementById("results");

    // Delete childrens of the old resuls
    var i;
    for (i = 0; i < e.childNodes.length; i++) e.removeChild(e.childNodes[0]); // xxx


    if (idx.length < 1) {
        e.innerHTML = "<H3>No documents found!</H3>";
        if (b)
            e.innerHTML += "<BR>[<a href='#' onclick='bimport(\"" + b + "\")'>Import in Basket " + b + "</a>]<BR>";
    } else {
        var div;
        var step = 20;
        var startnext = start + step;
        var endnext = end + step;
        var startprev = start - step;
        var endprev = end - step;
        e.innerHTML = "Found " + idx.length + " of " + trd(".count") + " documents" + ((b) ? " from the " + b : "") + "</H3><HR>";

        if (b)
            e.innerHTML += "<BR>[<a href='#' onclick='myexportbasket(\"" + b + "\")'>Export Basket " + b + "</a>] [<a href='#' onclick='bimport(\"" + b + "\")'>Import in Basket " + b + "</a>]<BR>";

        if (start > 0) {
            if (startprev < 0) startprev = 0;
            var starthtml = "[<a href='#' onclick='mysearch(0," + step + ",\"" + b + "\")'>Start</a>]";
            var prevhtml = "[<a href='#' onclick='mysearch(" + startprev + "," + endprev + ",\"" + b + "\")'><< Prev " + startprev + "-" + start + "</a>]";
        }
        else {
            var starthtml = "";
            var prevhtml = "";
        }

        if (end < idx.length) {
            if (endnext >= idx.length) endnext = idx.length;
            var endhtml = "[<a href='#' onclick='mysearch(" + (idx.length - step) + "," + idx.length + ",\"" + b + "\")'>End</a>]";
            var nexthtml = " [<a href='#' onclick='mysearch(" + startnext + "," + endnext + ",\"" + b + "\")'>" + startnext + "-" + endnext + " Next >></a>]";
        }
        else {
            var endhtml = "";
            var nexthtml = "";
        }

        if (start < 0) start = 0;
        if (end > idx.length) end = idx.length;

        var navigation = "<BR>" + starthtml + " " + prevhtml + " <B>" + start + "-" + end + "</B> " + nexthtml + " " + endhtml + "<BR><HR>";

        e.innerHTML += navigation;

        for (i = start; i < end; i++) { // xxx
            var myid = idx[i];
            if (myid < 1) continue;
            if (baski["edited"][myid]) {
                if (baski["ready"][myid])
                    var isready = " (Ready)";
                else
                    var isready = " (Not Ready)";
                var s = "<a href='#' onClick='editid(" + myid + ")'><img src='data:image/png;base64," + editpng + "' border=0> Edited" + isready + "</a> ::: ";
            } else {
                var s = "<a href='#' onClick='editid(" + myid + ")'><img src='data:image/png;base64," + editpng + "' border=0> Edit</a> ::: ";
            }
            for (property in baskets) {
                if (baski[property][myid]) {
                    s += "<a name='" + myid + "'><a href='#" + myid + "' onClick='togglebaski(this,\"" + property + "\",\"" + myid + "\")'>" + property + ": <b><img src='data:image/png;base64," + tickpng + "' border=0></b></a> ::: ";
                } else {
                    s += "<a name='" + myid + "'><a href='#" + myid + "' onClick='togglebaski(this,\"" + property + "\",\"" + myid + "\")'>" + property + ":<b><img src='data:image/png;base64," + publishxpng + "' border=0></b></a> ::: ";
                }
            }

            var div = document.createElement('div');
            div.innerHTML =
                " <B><A HREF='#" + myid + "' onClick='showid(\"" + myid + "\");return false;' CLASS='" + ((localStorage["beenhere." + myid]) ? "been" : "notbeen") + "'>" + (i + 1)
                + " " + trd(myid + ".subj")
                + " </B></A><BR><B>REFID:</B> " + trd(myid + ".refid")
                + " <B>DATE:</B> " + trd(myid + ".date")
                + " <B>ORIGIN:</B> " + trd(myid + ".origin")
                + " <B>CLASS:</B> " + trd(myid + ".class")
                + " <B>DEST:</B> " + trd(myid + ".dest")
                + " <BR>" + s + "<HR><BR>";
            e.appendChild(div);
        }

        e.innerHTML += navigation;
    }
//		alert("LEN:"+idx.length + " = " + idx);
}

//Export function	
function myexport(b, p) {
    var e = document.getElementById("srch");
    var sch = e.value;
    sch = sch.replace(/^\s+/, "").replace(/\s+$/, "");
    var w = sch.split(" ");
    var idx;
    if (baski == undefined) loadbaski(b);

    if (b) {
        idx = Object.keys(baski[b])  // Take the info from the published
    } else {
        idx = srch(w);
    }

    e = document.getElementById("results");

    // Delete childrens of the old resuls
    var i;
    for (i = 0; i < e.childNodes.length; i++) e.removeChild(e.childNodes[0]); // xxx


    if (idx.length < 1) {
        e.innerHTML = "<DIV><H1>No documents has found!</H1></DIV>";
    } else {

        var div;
        e.innerHTML = "<H3>Found " + idx.length + " of " + trd(".count") + " documents" + ((b) ? " from the " + b : "") + "</H3>";
        for (i = 0; i < idx.length; i++) { // xxx
            var myid = idx[i];
            if (myid < 1) continue;

            var div = document.createElement('div');
            div.innerHTML = "<pre>" +
                trd(myid + ".data") + '\n=======================DATA ENDS============================\n</pre>';
            e.appendChild(div);
        }
    }
//		alert("LEN:"+idx.length + " = " + idx);
}

function myexportbasket(b, p) {
    var e = document.getElementById("srch");
    var sch = e.value;
    sch = sch.replace(/^\s+/, "").replace(/\s+$/, "");
    var w = sch.split(" ");
    var idx;
    if (baski == undefined) loadbaski(b);

    if (b) {
        idx = Object.keys(baski[b])  // Take the info from the published
    } else {
        idx = srch(w);
    }

    e = document.getElementById("results");

    // Delete childrens of the old resuls
    var i;
    for (i = 0; i < e.childNodes.length; i++) e.removeChild(e.childNodes[0]); // xxx


    if (idx.length < 1) {
        e.innerHTML = "<DIV><H1>No documents has found!</H1></DIV>";
    } else {
        e.innerHTML = "<H3>Exporting " + idx.length + " of " + trd(".count") + " documents" + ((b) ? " from the " + b : "") + "</H3>";
        var div = document.createElement('div');
        var out = "Copy the following text and send it for import:<BR>";
        out += '<textarea cols=50 rows=5>';
        for (i = 0; i < idx.length; i++) {
            var myid = idx[i];
            if (myid < 1) continue;
            out += myid + ",";
        }
        e.innerHTML += out + "</textarea>";
    }
//		alert("LEN:"+idx.length + " = " + idx);
}

//Import in basket function	

function myimport(b) {
    var e = document.getElementById("timport");
    s = e.value.split(',');
    loadbaski(b);
    for (var i = 0; i < s.length; i++) //
        if (!baski[b][s[i]])
            addtobaski(b, s[i]);
    mysearch(0, 20, b);
}

function bimport(b) {
    e = document.getElementById("results");
    e.innerHTML = "<form id='fimport'><textarea cols=50 rows=5 id='timport'></textarea><BR><input type='button' value='Import in " + b + "' onclick='myimport(\"" + b + "\"); return false;'></form>";

}

function d2h(d) {
    return d.toString(16);
}
function h2d(h) {
    return parseInt(h, 16);
}
function s2h(s) {
    var cr = "";
    for (var i = 0; i < s.length; i++) cr = cr + d2h(s.charCodeAt(i));
    return cr;
}


/*
 Copyright (c) 2011, Daniel Guerrero
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of the Daniel Guerrero nor the
 names of its contributors may be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var Base64Binary = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* will return a  Uint8Array type */
    decodeArrayBuffer: function (input) {
        var bytes = Math.ceil((3 * input.length) / 4.0);
        var ab = new ArrayBuffer(bytes);
        this.decode(input, ab);

        return ab;
    },

    decode: function (input, arrayBuffer) {
        //get last chars to see if are valid
        var lkey1 = this._keyStr.indexOf(input.charAt(input.length - 1));
        var lkey2 = this._keyStr.indexOf(input.charAt(input.length - 1));

        var bytes = Math.ceil((3 * input.length) / 4.0);
        if (lkey1 == 64) bytes--; //padding chars, so skip
        if (lkey2 == 64) bytes--; //padding chars, so skip

        var uarray;
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;

        if (arrayBuffer)
            uarray = new Uint8Array(arrayBuffer);
        else
            uarray = new Uint8Array(bytes);

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        for (i = 0; i < bytes; i += 3) {
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf(input.charAt(j++));
            enc2 = this._keyStr.indexOf(input.charAt(j++));
            enc3 = this._keyStr.indexOf(input.charAt(j++));
            enc4 = this._keyStr.indexOf(input.charAt(j++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            uarray[i] = chr1;
            if (enc3 != 64) uarray[i + 1] = chr2;
            if (enc4 != 64) uarray[i + 2] = chr3;
        }

        return uarray;
    }
}