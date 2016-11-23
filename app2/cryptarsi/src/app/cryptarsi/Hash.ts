export class WordHash {
    static regex = /^[^\s]{2,15}/; // TODO: the regex must be more correct

    static hash(word: string) {
       return word.toLowerCase().match(WordHash.regex)[0]; // TODO: verify this
    }

    static cbPerHash(text: string, cb: any) {
        text.replace(WordHash.regex, (m) => {
            cb(WordHash.hash(m));
            return m;
        });
    }
}
