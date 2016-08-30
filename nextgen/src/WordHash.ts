/**
 * Created by delian on 8/30/16.
 */

import {Crypto} from './Crypto';

export class WordHash extends Crypto {
    hash(word:string):string {
        return word.toLowerCase().match(/^.{2,15}/)[0];
    }
}
