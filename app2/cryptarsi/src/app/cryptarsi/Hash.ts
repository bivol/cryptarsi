export class WordHash {
    static regex = /^.{2,15}/;

    static hash(word: string) {
       return word.toLowerCase().match(WordHash.regex);
    }
}
