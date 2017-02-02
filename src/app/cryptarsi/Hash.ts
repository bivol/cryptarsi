import { log } from './log';

export class WordHash {
    static regex = /[^\x00-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{2,15}/g; // TODO: the regex must be more correct

    // a-t-il déclaré à la
    static hash(word: string) {
        let a = [0, 0, 0, 0, 0, 0, 0, 0];
        if (word) {
            let m = word.toLowerCase().match(WordHash.regex);
            if (m) {
                let reg = 0;
                let w = m[0];
                for (let pos = 7; pos >= 0; pos--) {
                    reg += w.charCodeAt(pos % w.length) % 32;
                    reg += w.charCodeAt((8 + pos) % w.length) % 32 + 16;
                    //console.log('reg', reg);
                    a[pos] += reg;
                    a[pos] = a[pos] % 51;
                }
            }
        }
        return a.map(c => String.fromCharCode(c + (c > 25 ? 72 : 65))).join('');
    }

    static cbPerHash(text: string, cb: any) {
        text.replace(WordHash.regex, (m) => {
            //log('we have matched', m);
            cb(WordHash.hash(m));
            return m;
        });
    }
}
