import { log } from '../log';

export class WordHash {
    static regex = /[^\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{2,15}/g; // TODO: the regex must be more correct

    // a-t-il déclaré à la
    static hash(word: string) {
        if (word) {
            let m = word.toLowerCase().match(WordHash.regex);
            if (m) { return m[0]; }
        }
        return '';
    }

    static cbPerHash(text: string, cb: any) {
        text.replace(WordHash.regex, (m) => {
            //log('we have matched', m);
            cb(WordHash.hash(m));
            return m;
        });
    }
}
