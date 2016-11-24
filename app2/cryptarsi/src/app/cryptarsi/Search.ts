/**
 * Created by delian on 8/19/16.
 */

import { log } from '../log';
import { DB } from './Database';

interface IAndNot {
    not: any;
    and: any;
}

interface IPushA {
    match: any;
    string: string;
    regex?: any;
}

export class Search {

    constructor(private db: DB) {
    }

    private crossset(w: string[], s: string[]): string[] {
        let a: string[] = [];
        for (let i: number = s.length - 1; i >= 0; i--) {
            if (w.indexOf(s[i]) >= 0) {
                a.push(s[i]);
            }
        }
        return a;
    }

    private notcrossset(w: string[], s: string[]): string[] {
        let a: string[] = w;
        for (let i: number = s.length - 1; i >= 0; i--) {
            if (a.indexOf(s[i]) >= 0) {
                a.splice(a.indexOf(s[i]), 1);
            }
        }
        return a;
    }

    private andNot(words: string, isnt = false): IAndNot {

        function branchLen(text: string): number {
            let words: string = text.replace(/^\s+/, '').replace(/\s+$/, '');
            let i: number;
            let count: number;

            if (words.charAt(0) != '(') {
                return text.length;
            }
            for (i = 1, count = 1; count && i < words.length; i++) {
                count += (words.charAt(i) === '(') ? 1 : 0;
                count -= (words.charAt(i) === ')') ? 1 : 0;
            }
            return i;
        }

        function mixout(a: IAndNot, b: IAndNot): IAndNot {
            if (typeof a !== 'object'
             || typeof b !== 'object'
             || typeof a.and !== 'object'
             || typeof a.not !== 'object'
             || typeof b.and !== 'object'
             || typeof b.not !== 'object'
            ) {
                return a;
            }
            Object.keys(b.and).forEach(function(n) {a.and[n] = b.and[n]; });
            Object.keys(b.not).forEach(function(n) {a.not[n] = b.not[n]; });
            return a;
        }

        let out: IAndNot;
        let out2: IAndNot;
        if (typeof words !== 'string' || words == '') {
            return { and: {}, not: {} };
        }

        words = words.replace(/^\s+/, '').replace(/\s+$/, '');
        if (words.length === 0) {
            return { and: {}, not: {} };
        }
        //log('Words',words);

        if (words.charAt(0) === '(') {
            let blen = branchLen(words);
            let myset = words.substr(0, blen);
            let outset = words.substr(blen);
            myset = myset.replace(/^\(/, '').replace(/\)$/, '');
            out = this.andNot(myset);
            out2 = this.andNot(outset);
            return mixout(isnt ? { and: out.not, not: out.and } : out , out2);
        }

        if (words.charAt(0) === '-') { // Inverse
            return this.andNot(words.substr(1), isnt ? false : true);
        }

        if (words.charAt(0) === '+') {
            return this.andNot(words.substr(1), isnt);
        }

        let x = words.match(/^(\S+)(.+)?$/);
        let y = {};
        if (x == null) {
            return { and: {}, not: {} };
        }
        y[x[1]] = 1;
        return mixout(isnt ? { and: {} , not: y } : { and: y, not: {} } , this.andNot(x[2]));
    }

    private coRegexProc(words: string): IPushA[] {
        if (typeof words !== 'string' || words == '') {
            return [];
        }
        words = words.replace(/^\s+/, '').replace(/\s+$/, '');
        if (words.length === 0) {
            return [];
        }

        function regexArray(words: string): IPushA[] {
            let w: string = words;
            let pushA: IPushA[] = [];

            function splitPush(words: string, inv = false): void {
                while (words.match(/[\+\-]/)) {
                    words = words.replace(/^\s+/, '').replace(/\s+$/, '');
                    if (!words.match(/^[\+\-]/)) {
                        words = words.replace(/^(.+?)([\+\-])/, function(m, a, p) {
                            pushA.push({ match: inv ? '-' : '+', string: a });
                            return p;
                        });
                    }
                    words = words.replace(/^([\+\-])(\S+)?/, function(m, p, a) {
                        pushA.push({ match: (((inv ? 1 : 0)^( p != '-' ? 1 : 0)) ? '+' : '-'), string: a});
                        return '';
                    });
                }
                if (words) {
                    pushA.push({match: (inv ? '-' : '+'), string: words});
                }
            }

            function branches() {
                w = w.replace(/([\+\-]?)\((.+?)\)/g, function(m, p, a) {
                    splitPush(a, p == '-');
                    return '';
                });
            }

            branches();
            splitPush(w);

            pushA.forEach(function(n) {
                n.string = n.string.replace(/^\s+/, '').replace(/\s+$/, '').replace(/[\s\!-\/\:-\@\[-\]\'\{-~]+/g, '.*');
                n.regex = new RegExp(n.string, 'i');
            });

            return pushA;
        }

        return regexArray(words);
    }

    /**
     *  This function implements the search
     * @param {string} srch
     * @returns {string[]}
     * 
     * @memberOf Search
     */
    searchRule(srch: string, cb = (n, s) => {}) {
        return new Promise((resolve, reject) => {
            let out = this.andNot(srch);

            if (Object.keys(out.and).length === 0) {
                return resolve([]); // TODO: check it, if we go for callbacks
            }
            let w = Object.keys(out.and)
                        .concat(Object.keys(out.not))
                        .sort((x: string, y: string): number => {
                            return x.length <= y.length ? 1 : 0;
                        });
            let w1 = Object.keys(out.and)
                        .sort((x: string, y: string): number => {
                            return x.length <= y.length ? 1 : 0;
                        });

            w.unshift(w.splice(w.indexOf(w1[0]), 1)[0]); // Put the largest AND word at the front

            this.db.getWordHash(w[0]).then((myset: any[]) => {
                let i = 1;

                console.log('MySet is now', myset, 'w', w, 'i', i);

                let chain = new Promise( (res, rej) => {
                    function nextStep() {
                        if (i < w.length && (myset.length >= (w.length - i))) {
                            this.db.getWordHash(w[i]).then((data) => {
                                if (out.and[w[i]]) {
                                    myset = this.crossset(myset, data);
                                } else {
                                    myset = this.notcrossset(myset, data);
                                }
                                i++;
                                nextStep(); // Close the loop
                            }).catch(rej);
                        } else {
                            res();
                        }
                    }
                    nextStep();
                });
                chain.then(() => {
                    // Now we have a set with probable matching, lets do the second match
                    let regArray = this.coRegexProc(srch);

                    let fullStrings = srch.match(/([\+\-])?\"(.+?)\"/g);
                    if (fullStrings) {
                        fullStrings.forEach(function(n) {
                            let o: IPushA = { match: '+', string: '' };
                            if (n.match(/^\-/)) {
                                o.match = '-';
                            }
                            o.string = n.replace(/^[\+\-]?\"/, '')
                                .replace(/\"$/, '')
                                .replace(/[\s\!-\/\:-\@\[-\]\'\{-~]+/g, "[\\s\\!-\\/\\:-\\@\\[-\\]\\'\\{-~]*");
                            o.regex = new RegExp(o.string, 'i');
                            regArray.unshift(o);
                        });
                    }

                    console.log('MySet is', myset);
                    myset.forEach((n) => {
                        this.db.getData(n).then((s) => {
                            for (let i = 0; i < regArray.length; i++) {
                                let t = regArray[i].regex.test(s);
                                if (t && regArray[i].match == '-') { return; }
                                if ((!t) && regArray[i].match == '+') { return; }
                            }
                            cb(n, s);
                        }).catch(reject);
                    });
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }
}