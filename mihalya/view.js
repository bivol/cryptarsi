/**
 * Created by delian on 10/4/14.
 */

var view = (function () {
    var baski = new Object();
    var basket = new Object();
    var publi = new Object();

    if (localStorage == undefined) { // No local storage support
        var e = document.getElementById("nohtml5");
        e.style.display = "block";
        return;
    }

    function validate() {
        var e = document.getElementById("mylogin");
        e.style.display = "none";
        //	if (localStorage["wiki_status"] !== "OK")
        //		e=document.getElementById("reload");
        //	else {
        var f = document.getElementById("author");
        if (search.checkuser(f.name.value, f.pass.value)) e = document.getElementById("search");
        else e = document.getElementById("mylogin");
        //	}
        e.style.display = "block";
    }

	 function showencoder() {
        var e = document.getElementById("encoder");
        e.style.display = "block";
        var l = document.getElementById("mylogin");
        l.style.display = "none";
    }
    
    function reldb() {
        var e;
        search.cledb();
        e = document.getElementById("search");
        e.style.display = "none";
        e = document.getElementById("mylogin");
        e.style.display = "block";
        //	e=document.getElementById("reload");e.style.display="none";
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
        var idx;
        if (baski == undefined) loadbaski(b);
        if (b) {
            idx = Object.keys(baski[b])  // Take the info from the basket
        } else if (sch) {
            idx = search.search(sch);
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
            e.innerHTML = "<DIV class=\"alert alert-warning\"><H5>No documents found!</H5></DIV>";
        
        } else {
            var div;
            var step = 20;
            var startnext = start + step;
            var endnext = end + step;
            var startprev = start - step;
            var endprev = end - step;
            e.innerHTML = "<DIV class=\"alert alert-success\"><H5>Found " + idx.length + " of " + search.trd(".count") + " documents" + ((b) ? " with the tag <span class=\"glyphicon glyphicon-tag\"></span><B>" + b : "</b>") + "</H5></DIV>";

            if (start > 0) {
                if (startprev < 0) startprev = 0;
                var starthtml = "[<a href='#' onclick='view.mysearch(0," + step + ",\"" + b + "\")'><span class=\"glyphicon glyphicon-step-backward\"></span> Start</a></a>]";
                var prevhtml = "[<a href='#' onclick='view.mysearch(" + startprev + "," + endprev + ",\"" + b + "\")'> <span class=\"glyphicon glyphicon-backward\"></span> Prev " + startprev + "-" + start + "</a>]";
            }
            else {
                var starthtml = "";
                var prevhtml = "";
            }

            if (end < idx.length) {
                if (endnext >= idx.length) endnext = idx.length;
                var endhtml = "[<a href='#' onclick='view.mysearch(" + (idx.length - step) + "," + idx.length + ",\"" + b + "\")'>End <span class=\"glyphicon glyphicon-step-forward\"></span></a>]";
                var nexthtml = " [<a href='#' onclick='view.mysearch(" + startnext + "," + endnext + ",\"" + b + "\")'>" + startnext + "-" + endnext + " Next <span class=\"glyphicon glyphicon-forward\"></span></a>]";
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
                    if (baski["ready"][myid]) {
                        var s = "<a href='#' onClick='view.editid(" + myid + ")'><span class=\"glyphicon glyphicon-stop\">Edited(Ready)</span></a> | ";
                   } else {
                        var s = "<a href='#' onClick='view.editid(" + myid + ")'><span class=\"glyphicon glyphicon-pause\">Edited(Progress)</span></a> | ";
                    }
                    } else {
                    var s = "<a href='#' onClick='view.editid(" + myid + ")'><span class=\"glyphicon glyphicon-edit\">Edit</span></a> | ";
                    }
                
                for (property in baskets) {
                    if (baski[property][myid]) {
                        s += "<a name='" + myid + "'><a href='#" + myid + "'  onClick='view.togglebaski(this,\"" + property + "\",\"" + myid + "\")'><span class=\"glyphicon glyphicon-saved\">" + property + "</span></a> | ";
                    } else {
                        s += "<a name='" + myid + "'><a href='#" + myid + "' onClick='view.togglebaski(this,\"" + property + "\",\"" + myid + "\")'><span class=\"glyphicon glyphicon-tag\">" + property + "</span></a> | ";
                    }
                }

                var div = document.createElement('div');
                div.innerHTML =
                    " <B><A HREF='#" + myid + "' onClick='return view.showid(\"" + myid + "\")' CLASS='" + ((localStorage["beenhere." + myid]) ? "been" : "notbeen") + "'>" + (i + 1)
                    + " " + search.trd(myid + ".subj")
                    + " </B></A><BR><B>REFID:</B> " + search.trd(myid + ".refid")
                    + " <B>DATE:</B> " + search.trd(myid + ".date")
                    + " <B>ORIGIN:</B> " + search.trd(myid + ".origin")
                    + " <B>CLASS:</B> " + search.trd(myid + ".class")
                    + " <B>DEST:</B> " + search.trd(myid + ".dest")
                    + " <BR>" + s + "<HR><BR>";
                e.appendChild(div);
            }

            e.innerHTML += navigation;
        }
//		alert("LEN:"+idx.length + " = " + idx);
    }


//    function showimport() {
//        var x = document.getElementById("import");
//        x.style.display = "block";
//    }

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
            t.innerHTML = "<span class=\"glyphicon glyphicon-tag\">" + b + "</span>";
        }
        else {
            addtobaski(b, id);
            t.innerHTML = "<span class=\"glyphicon glyphicon-saved\">" +b + "</span>";
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

    //Export function
    function myexport(b, p) {
        var e = document.getElementById("srch");
        var idx;
        if (baski == undefined) loadbaski(b);

        if (b) {
            idx = Object.keys(baski[b])  // Take the info from the published
        } else {
            idx = search.search(e.value);
        }

        e = document.getElementById("results");

        // Delete childrens of the old resuls
        var i;
        for (i = 0; i < e.childNodes.length; i++) e.removeChild(e.childNodes[0]); // xxx


        if (idx.length < 1) {
            e.innerHTML = "<DIV class=\"alert alert-warning\"><H5>No documents found!</H5></DIV>";
        } else {

            var div;
            e.innerHTML = "<DIV class=\"alert alert-success\"><H5>Found " + idx.length + " of " + search.trd(".count") + " documents" + ((b) ? " with the tag <span class=\"glyphicon glyphicon-tag\"></span><B>" + b : "</B>") + "</H5></DIV>";
            for (i = 0; i < idx.length; i++) { // xxx
                var myid = idx[i];
                if (myid < 1) continue;

                var div = document.createElement('div');
                div.innerHTML = "<pre>" +
                    search.trd(myid + ".data") + '\n=======================DATA ENDS============================\n</pre>';
                e.appendChild(div);
            }
        }
//		alert("LEN:"+idx.length + " = " + idx);
        return false;
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
        var output = "<li><a href='#' onclick='view.mysearch(0,20,\"edited\")'><span class=\"glyphicon glyphicon-eye-open\"></span></a> <a href='#' onclick='view.myexport(\"edited\")'><span class=\"glyphicon glyphicon-list\"></span></a> <a href='#' onclick='view.myexportbasket(\"edited\")'><span class=\"glyphicon glyphicon-export\"></span></a> <a href='#' onclick='view.bimport(\"edited\")'><span class=\"glyphicon glyphicon-import\"></span></a>Edited</li><li><a href='#' onclick='view.mysearch(0,20,\"ready\")'><span class=\"glyphicon glyphicon-eye-open\"></span></a> <a href='#' onclick='view.myexport(\"ready\")'><span class=\"glyphicon glyphicon-list\"></span></a> <a href='#' onclick='view.myexportbasket(\"ready\")'><span class=\"glyphicon glyphicon-export\"></span></a> <a href='#' onclick='view.bimport(\"ready\")'><span class=\"glyphicon glyphicon-import\"></span></a> Ready</li>";
        for (property in baskets) {
            output += "<li><a href='#' onclick='view.mysearch(0,20,\"" + property + "\")'><span class=\"glyphicon glyphicon-eye-open\"></span></a> <a href='#' onclick='view.myexport(\"" + property + "\")'><span class=\"glyphicon glyphicon-list\"></span></a> <a href='#' onclick='view.myexportbasket(\"" + property + "\")'><span class=\"glyphicon glyphicon-export\"></span></a> <a href='#' onclick='view.bimport(\"" + property + "\")'><span class=\"glyphicon glyphicon-import\"></span></a> <a class=\"glyphicon glyphicon-erase\" href='#' onClick='view.removebasket(\"" + property + "\")'></a> " + property + "</li>";
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

    function myexportbasket(b, p) {
        var e = document.getElementById("srch");
        var idx;
        if (baski == undefined) loadbaski(b);

        if (b) {
            idx = Object.keys(baski[b])  // Take the info from the published
        } else {
            idx = search.search(e.value);
        }

        e = document.getElementById("results");

        // Delete childrens of the old resuls
        var i;
        for (i = 0; i < e.childNodes.length; i++) e.removeChild(e.childNodes[0]); // xxx


        if (idx.length < 1) {
            e.innerHTML = "<DIV class=\"alert alert-warning\"><H5>No documents  found!</H5></DIV>";
        } else {
            e.innerHTML = "<DIV class=\"alert alert-success\"><H5>Exporting " + idx.length + " of " + search.trd(".count") + " documents" + ((b) ? " with the tag <span class=\"glyphicon glyphicon-tag\"></span><B>" + b : "</B>") + "</H5></DIV>";
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

    function showid(id) {
        var e = document.getElementById("results");
        var a = document.getElementById("attachments");
        var m = document.getElementById("media");
        m.innerHTML = "";
        if (baski["edited"][id]) {
            if (baski["ready"][id]) {
            		var s = "<a href='#' onClick='view.editid(" + id + ")'><span class=\"glyphicon glyphicon-stop\">Edited(Ready)</span></a> | ";
                } else {
                    var s = "<a href='#' onClick='view.editid(" + id + ")'><span class=\"glyphicon glyphicon-pause\">Edited(Progress)</span></a> | ";
                } 
                
                } else {
                 var s = "<a href='#' onClick='view.editid(" + id + ")'><span class=\"glyphicon glyphicon-edit\">Edit</span></a> | ";
                }
        for (property in baskets) {
            if (baski[property][id]) {
                s += "<a name='" + id + "'></span><a href='#" + id + "' onClick='view.togglebaski(this,\"" + property + "\",\"" + id + "\")'><span class=\"glyphicon glyphicon-saved\">" + property + " </a> | ";
            } else {
                s += "<a name='" + id + "'><a href='#" + id + "' onClick='view.togglebaski(this,\"" + property + "\",\"" + id + "\")'><span class=\"glyphicon glyphicon-tag\"></span>" + property + " </a> | ";
            }
        }
        var ms = "";

        var ipp = search.trd(id + ".attachcount");
        if (ipp > 0) {
        var mm = document.getElementById("multimedia");
        mm.style.display = "block";
        ms +="<ul class=\"facet-values list-unstyled\">";
            for (ip = 1; ip < ipp; ip++) {
             ms += "<li>";
                if (search.trd(id + ".attachtype." + ip) == "pdf") { //pdf
                    ms += "<A HREF='#" + id + ip + "' onClick='return view.showpdf(\"" + id + "\",\"" + ip + "\")' CLASS='" + ((localStorage["beenhere." + id + ip]) ? "been" : "notbeen") + "'><span class=\"glyphicon glyphicon glyphicon-file\"> </span> ";
                    ms += search.trd(id + ".attachname." + ip);
                    ms += "</A>";

                } else {
                    ms += "<A HREF='#" + id + ip + "' onClick='document.getElementById(\"media\").innerHTML=\"\";view.showmedia(\"" + id + "\",\"" + ip + "\");return false;' CLASS='" + ((localStorage["beenhere." + id + ip]) ? "been" : "notbeen") + "'>";

                    if (search.trd(id + ".attachtype." + ip) == "png" || search.trd(id + ".attachtype." + ip) == "jpg")
                        ms += "<span class=\"glyphicon glyphicon glyphicon-picture\"> </span> ";

                    if (search.trd(id + ".attachtype." + ip) == "mp3" || search.trd(id + ".attachtype." + ip) == "ogg")
                        ms += "<span class=\"glyphicon glyphicon-volume-up\"> </span> ";

                    ms += search.trd(id + ".attachname." + ip);
                    ms += "</A>";
                } //not pdf
             ms += "</li>";
            }
            ms +="</ul>";
            
        }
        e.innerHTML = "<H1>" + search.trd(id + ".subj") + "</H1><HR><B>REFID:</B> " + search.trd(id + ".refid")
            + " <B>DATE:</B> " + search.trd(id + ".date")
            + " <B>ORIGIN:</B> " + search.trd(id + ".origin")
            + " <B>CLASS:</B> " + search.trd(id + ".class")
            + " <B>DEST:</B> " + search.trd(id + ".dest");

        e.innerHTML += "<BR><B>TEXT:</B>" + search.trd(id + ".data") + "<BR>" + s + "<HR>";

        a.innerHTML = " <BR>" + ms;
			
			//Highlight words from the search field
			var s = document.getElementById("srch").value;
			if(s){
			words = s.split(" ");
	                for (w=0;w<words.length;w++) {
						$('#results').highlight(trimmer(words[w],'+-()').trim());
					}
			}
			
        localStorage["beenhere." + id] = 1;
        return false;
    }

    function showmedia(id, ip) {
        var e = document.getElementById("media");
        if (search.trd(id + ".attachtype." + ip) == "jpg" || search.trd(id + ".attachtype." + ip) == "png") {
            if (search.trd(id + ".attachname." + ip)) {
                e.innerHTML = "<P>" + search.trd(id + ".attachname." + ip) + "</P><P><img width=800 src=\"data:image/png;base64," + search.trdm(id + ".attachdata." + ip) + "\"><P>";
                //g.document.write('<html>' + search.trd(id + ".attachname." + ip) + '<P><img width="800" src="data:image/jpg;base64,' + search.trdm(id + ".attachdata." + ip) + '"></html>');
            } else {
                e.innerHTML = '<P>' + search.trd(id + ".attachname." + ip) + '<P>Can\'t be found';
            }
        }

        if (search.trd(id + ".attachtype." + ip) == "mp3" || search.trd(id + ".attachtype." + ip) == "ogg" || search.trd(id + ".attachtype." + ip) == "wav") {
            if (search.trd(id + ".attachname." + ip)) {
                if (search.trd(id + ".attachtype." + ip) == "ogg")
                    e.innerHTML = '<P>' + search.trd(id + ".attachname." + ip) + '<P><audio controls="controls" autobuffer="autobuffer" autoplay="autoplay"><source src="data:audio/ogg;base64,' + search.trdm(id + ".attachdata." + ip) + '"/></audio>';
                if (search.trd(id + ".attachtype." + ip) == "mp3")
                    e.innerHTML = '<P>' + search.trd(id + ".attachname." + ip) + '<P><audio controls="controls" autobuffer="autobuffer" autoplay="autoplay"><source src="data:audio/mpeg;base64,' + search.trdm(id + ".attachdata." + ip) + '"/></audio>';
            } else {
                e.innerHTML = '<P>' + search.trd(id + ".attachname." + ip) + '<P>Can\'t be found';
            }
        }

        localStorage["beenhere." + id + ip] = 1;
        return false;
    }

    function showpdf(id, ip, file) {
        if (search.trd(id + ".attachname." + ip)) {
            var pdfdata = search.trdm(id + ".attachdata." + ip);
            var databin = Base64Binary.decodeArrayBuffer(pdfdata);
            var pdf = PDFView.load(databin);
            s = document.getElementById("search");
            s.style.display = "none";
            v = document.getElementById("pdfview");
            v.style.display = "block";
        } else {
            canvas.innerHTML = '<P>' + search.trd(id + ".attachname." + ip) + '<P>Can\'t be found';
        }
        return false;
    }

    function editid(id) {
        var e = document.getElementById("results");
        if (localStorage[search.dhs(id + ".dataed")]) {
            var toedit = search.trd(id + ".dataed");
        } else {
            var toedit = search.trd(id + ".data");
        }

        if (baski["edited"][id]) {
            if (baski["ready"][id]) {
            var s = "<a href='#' onClick='view.editid(" + id + ")'><span class=\"glyphicon glyphicon-stop\"></span> Edited(Ready)</a> | ";
        	} else {
            var s = "<a href='#' onClick='view.editid(" + id + ")'><span class=\"glyphicon glyphicon-edit\"></span> Edit(Progress)</a> | ";
        }
        } else {
        	var s = "<a href='#' onClick='view.editid(" + id + ")'><span class=\"glyphicon glyphicon-edit\"></span> Edit</a> | ";
        }
        for (property in baskets) {
            if (baski[property][id]) {
                s += "<a name='" + id + "'><a href='#" + id + "' onClick='view.togglebaski(this,\"" + property + "\",\"" + id + "\")'><span class=\"glyphicon glyphicon-saved\"></span>" + property + "</a> | ";
            } else {
                s += "<a name='" + id + "'><a href='#" + id + "' onClick='view.togglebaski(this,\"" + property + "\",\"" + id + "\")'><span class=\"glyphicon glyphicon-tag\"></span>" + property + "</a> | ";
            }
        }

        e.innerHTML = "<form><textarea cols=80 rows=100 id='editid'>" + toedit + "</textarea><BR><input type='button' class='glyphicon glyphicon-save' value='Save' onclick='view.saveedited(" + id + "); return false;' > <input type='button' class='glyphicon glyphicon-save' value='Ready' onclick='view.saveedited(" + id + ",1); return false;'> </FORM><BR>" + s;
        return false;
    }

    function saveedited(id, r) {
        var e = document.getElementById("editid").value;
        localStorage[search.dhs(id + ".dataed")] = search.dhs(e);
        addtobaski("edited", id)
        if (r) {
            addtobaski("ready", id)
            showid(id);
        } else {
            editid(id);
        }
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
        return false;
    }

    function bimport(b) {
        e = document.getElementById("results");
        e.innerHTML = "<form id='fimport'><textarea cols=50 rows=5 id='timport'></textarea><BR><input type='button' value='Import in " + b + "' onclick='view.myimport(\"" + b + "\")'></form>";

    }

function trimmer(str, characters) {
  var c_array = characters.split('');
  var result  = '';

  for (var i=0; i < characters.length; i++)
    result += '\\' + c_array[i];

  return str.replace(new RegExp('^[' + result + ']+|['+ result +']+$', 'g'), '');
}

// End basket functions

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
    };


    function loadimport() {
        var x = document.getElementById("vimport");
        var y = document.getElementById("bimport");
        search.loadimport(x,y);
        document.getElementById("import").innerHTML = "Imported " + f.lenght + " records";
    }

    function init() {
        // Request for user/pass
        var e = document.getElementById("mylogin");
        e.style.display = "block";

        document.getElementById("authorBtn").addEventListener("click", validate);
        document.getElementById("clearDb").addEventListener("click", reldb);
        document.getElementById("fimport").addEventListener("submit", loadimport);
        document.getElementById("addbasket").addEventListener("click", addbasket);
        document.getElementById("encodeBtn").addEventListener("click", showencoder);
        loadbasket();
        search.init();
    }

    return {
        init: init,
        bimport: bimport,
        myexportbasket: myexportbasket,
        togglebaski: togglebaski,
        removebasket: removebasket,
        myexport: myexport,
        myimport: myimport,
        mysearch: mysearch,
        editid: editid,
        showid: showid,
        saveedited: saveedited,
        showpdf: showpdf,
        showmedia: showmedia
    }
})();