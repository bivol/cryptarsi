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


var search = (function () {
    var user;
    var pass;
    var nonce;
    var pass2;

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

    function checkuser(user,pass) {
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

    function cledb() {
        localStorage.clear();
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
                try {
                    var mykey = f[i].getElementsByTagName("key")[0].textContent;
                    var myval = f[i].getElementsByTagName("value")[0].textContent;
                    localStorage[mykey] = myval;
                } catch (e) {}
            }
            return 1;
        }
        return 0;
    }

//Import data functions
    function loadimport(x,y) {
        // Read the values
        var f = x.value.getElementsByTagName("data");
        var b = y.value;
        var i;
        for (i = 0; i < f.length; i++) {
            try {
                var mykey = f[i].getElementsByTagName("key")[0].textContent;
                var myval = f[i].getElementsByTagName("value")[0].textContent;
                localStorage[mykey] = myval;
            } catch (e) {}
        }
        return 1;
    }


//End import functions

    function init() {
    }

    function dhs(w) {
        return Aes.Ctr.encrypt(w, pass2, 256, nonce);
    }

    function myhash(w) {
        return w.toLowerCase().match(/^.{2,15}/)[0];
        //return  w.toLowerCase().match(/^(\w|[\x80-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}){2,15}/)[0];
    }

    function crossset(w, s) {
        var a = [];
        for (var i = s.length-1; i >= 0; i--) if (w.indexOf(s[i])>=0) a.push(s[i]);
        return a;
    }

    function notcrossset(w, s) {
        var a = w;
        for (var i = s.length-1; i >= 0; i--) if (a.indexOf(s[i])>=0) a.splice(a.indexOf(s[i]),1);
        return a;
    }

    function setextr(w) {
        var d = dhs(w + ".idx");
        if (lstr(d)) {
            var s = Aes.Ctr.decrypt(localStorage[d], pass2, 256);
            return s.split(",")
        }
        else return [];
    }


    function searchRule(srch) {
        function andNot(words,isnt) {
            function branchLen(text) {
                var words = text.replace(/^\s+/, "").replace(/\s+$/, "");
                if (words.charAt(0)!='(') return text.length;
                var i,count;
                for (i=1,count=1;count&&i<words.length;i++) {
                    count+=(words.charAt(i)=='(')?1:0;
                    count-=(words.charAt(i)==')')?1:0;
                }
                return i;
            }
            function mixout(a,b) {
                if (typeof a != 'object' || typeof b != 'object' || typeof a.and != 'object' || typeof a.not != 'object' || typeof b.and != 'object' || typeof b.not != 'object') return a;
                Object.keys(b.and).forEach(function(n) {a.and[n]= b.and[n]});
                Object.keys(b.not).forEach(function(n) {a.not[n]= b.not[n]});
                return a;
            }

            var out; var out2;
            if (typeof words != 'string' || words == '') return { and: {}, not: {} };
            words = words.replace(/^\s+/, "").replace(/\s+$/, "");
            if (words.length==0) return { and: {}, not: {} };
            //console.log('Words',words);

            if (words.charAt(0) == '(') {
                var blen = branchLen(words);
                var myset = words.substr(0,blen);
                var outset = words.substr(blen);
                myset = myset.replace(/^\(/,"").replace(/\)$/,"");
                out = andNot(myset);
                out2 = andNot(outset);
                return mixout(isnt?{ and: out.not, not: out.and }:out,out2);
            }

            if (words.charAt(0) == '-') { // Inverse
                return andNot(words.substr(1),isnt?false:true);
            }

            if (words.charAt(0) == '+') return andNot(words.substr(1),isnt);

            var x = words.match(/^(\S+)(.+)?$/);
            var y = {};
            if (x==null) return { and: {}, not: {} };
            y[x[1]]=1;
            return mixout(isnt?{ and: {} , not: y }:{ and: y, not: {} },andNot(x[2]));
        }

        function coRegexProc(words) {
            if (typeof words != 'string' || words == '') return [];
            words = words.replace(/^\s+/, "").replace(/\s+$/, []);
            if (words.length==0) return [];

            function regexArray(words) {
                var w = words;
                var pushA = [];

                function splitPush(words,inv) {
                    while(words.match(/[\+\-]/)) {
                        words = words.replace(/^\s+/,"").replace(/\s+$/,"");
                        if (!words.match(/^[\+\-]/)) words = words.replace(/^(.+?)([\+\-])/,function(m,a,p) {
                            pushA.push({ match: inv?"-":"+", string: a });
                            return p;
                        });
                        words = words.replace(/^([\+\-])(\S+)?/,function(m,p,a) {
                            pushA.push({ match: (((inv?1:0)^(p!='-'?1:0))?"+":"-"), string: a});
                            return "";
                        });
                    }
                    if (words) pushA.push({match:(inv?"-":"+"), string:words});
                }

                function branches() {
                    w=w.replace(/([\+\-]?)\((.+?)\)/g,function(m,p,a) {
                        splitPush(a,p=='-');
                        return "";
                    });
                }

                branches();
                splitPush(w);

                pushA.forEach(function(n) {n.string = n.string.replace(/^\s+/,"").replace(/\s+$/,"").replace(/[\s\!-\/\:-\@\[-\]\'\{-~]+/g,".*");n.regex = new RegExp(n.string,"i"); });

                return pushA;
            }
            return regexArray(words);
        }

        var out = andNot(srch);

        if (Object.keys(out.and).length==0) return [];
        var w = Object.keys(out.and).concat(Object.keys(out.not)).sort(function(x,y){ return x.length<= y.length });
        var w1 = Object.keys(out.and).sort(function(x,y){ return x.length<= y.length });

        w.unshift(w.splice(w.indexOf(w1[0]),1)[0]); // Put the largest AND word at the front

        var myset = setextr(myhash(w[0]));
        for (i = 1; i < w.length  && (myset.length >= (w.length-i)); i++) myset = (out.and[w[i]])?crossset(myset, setextr(myhash(w[i]))):notcrossset(myset, setextr(myhash(w[i])));

        // Now we have a set with probable matching, lets do the second match

        var outset = [];
        var regArray = coRegexProc(srch);

        var fullStrings = srch.match(/([\+\-])?\"(.+?)\"/g);
        if (fullStrings) {
            fullStrings.forEach(function(n) {
                var o = { match: '+' };
                if (n.match(/^\-/)) o.match = '-';
                o.string = n.replace(/^[\+\-]?\"/,"").replace(/\"$/,"").replace(/[\s\!-\/\:-\@\[-\]\'\{-~]+/g,"[\\s\\!-\\/\\:-\\@\\[-\\]\\'\\{-~]*");
                o.regex = new RegExp(o.string,"i");
                regArray.unshift(o);
            })
        }

        myset.forEach(function(n) {
            var s = trd(n+".data");

            // Stings match


            for (var i=0;i<regArray.length;i++) {
                var t = regArray[i].regex.test(s);
                if (t && regArray[i].match == '-') return;
                if ((!t) && regArray[i].match == '+') return;
            }
            outset.push(n);
        });

        return outset;
    }


    function srch(words) {
        return searchRule(words);
        var w = words.replace(/^\s+/, "").replace(/\s+$/, "").split(" ");
        if (!w || w.length==0) return [];
        var i; var zl = w.length;
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

    return {
        init: init,
        search: srch,
        cledb: cledb,
        trd: trd,
        trdm: trdm,
        checkuser: checkuser,
        dhs: dhs
    }
})();
