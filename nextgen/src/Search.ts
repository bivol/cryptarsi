/**
 * Created by delian on 8/19/16.
 */

import {Crypto} from './Crypto';
import {Storage} from './Storage';
import {WordHash} from './WordHash';

var crypt = new Crypto('parola','nonce'); //TODO: password store
var storage = new Storage();

interface IAndNot {
    not: any,
    and: any
}

interface IPushA {
    match: any,
    string: string,
    regex?: any
}

export class Search {
    constructor() {

    }

    crossset(w: string[], s: string[]): string[] {
        let a: string[] = [];
        for (let i:number = s.length-1; i>=0; i--) if (w.indexOf(s[i])>=0) a.push(s[i]);
        return a;
    }

    notcrossset(w: string[], s: string[]): string[] {
        let a: string[] = w;
        for (let i:number = s.length-1; i >= 0; i--) if (a.indexOf(s[i])>=0) a.splice(a.indexOf(s[i]),1);
        return a;
    }

    andNot(words: string, isnt: boolean = false): IAndNot {

        function branchLen(text: string): number {
            var words: string = text.replace(/^\s+/, "").replace(/\s+$/, "");
            var i: number;
            var count: number;

            if (words.charAt(0)!='(') return text.length;
            for (i=1,count=1; count&&i<words.length; i++) {
                count+=(words.charAt(i)=='(')?1:0;
                count-=(words.charAt(i)==')')?1:0;
            }
            return i;
        }

        function mixout(a:IAndNot,b:IAndNot):IAndNot {
            if (typeof a != 'object' || typeof b != 'object' || typeof a.and != 'object' || typeof a.not != 'object' || typeof b.and != 'object' || typeof b.not != 'object') return a;
            Object.keys(b.and).forEach(function(n) {a.and[n]= b.and[n]});
            Object.keys(b.not).forEach(function(n) {a.not[n]= b.not[n]});
            return a;
        }

        var out:IAndNot;
        var out2:IAndNot;
        if (typeof words != 'string' || words == '') return { and: {}, not: {} };

        words = words.replace(/^\s+/, "").replace(/\s+$/, "");
        if (words.length==0) return { and: {}, not: {} };
        //console.log('Words',words);

        if (words.charAt(0) == '(') {
            var blen = branchLen(words);
            var myset = words.substr(0,blen);
            var outset = words.substr(blen);
            myset = myset.replace(/^\(/,"").replace(/\)$/,"");
            out = this.andNot(myset);
            out2 = this.andNot(outset);
            return mixout(isnt?{ and: out.not, not: out.and }:out,out2);
        }

        if (words.charAt(0) == '-') { // Inverse
            return this.andNot(words.substr(1),isnt?false:true);
        }

        if (words.charAt(0) == '+') return this.andNot(words.substr(1),isnt);

        var x = words.match(/^(\S+)(.+)?$/);
        var y = {};
        if (x==null) return { and: {}, not: {} };
        y[x[1]]=1;
        return mixout(isnt?{ and: {} , not: y }:{ and: y, not: {} },this.andNot(x[2]));
    }

    coRegexProc(words:string):IPushA[] {
        if (typeof words != 'string' || words == '') return [];
        words = words.replace(/^\s+/, "").replace(/\s+$/, []);
        if (words.length==0) return [];

        function regexArray(words:string):IPushA[] {
            var w:string = words;
            var pushA:IPushA[] = [];

            function splitPush(words:string,inv:boolean=false):void {
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

    searchRule(srch: string): string[] {
        var out = this.andNot(srch);

        if (Object.keys(out.and).length==0) return [];
        var w = Object.keys(out.and).concat(Object.keys(out.not)).sort((x:string,y:string):number=>{ return x.length<=y.length?1:0 });
        var w1 = Object.keys(out.and).sort((x:string,y:string):number=>{ return x.length<=y.length?1:0 });

        w.unshift(w.splice(w.indexOf(w1[0]),1)[0]); // Put the largest AND word at the front

        var myset = storage.setextr(WordHash.hash(w[0]),function() {

        });
        for (let i:number = 1; i < w.length  && (myset.length >= (w.length-i)); i++) myset = (out.and[w[i]])?crossset(myset, setextr(myhash(w[i]))):notcrossset(myset, setextr(myhash(w[i])));

        // Now we have a set with probable matching, lets do the second match

        var outset = [];
        var regArray = this.coRegexProc(srch);

        var fullStrings = srch.match(/([\+\-])?\"(.+?)\"/g);
        if (fullStrings) {
            fullStrings.forEach(function(n) {
                var o:IPushA = { match: '+', string: '' };
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


}