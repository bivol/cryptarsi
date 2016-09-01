/**
 * Created by delian on 8/30/16.
 */

import {Crypto} from './Crypto';

export class WordHash extends Crypto {

    hash(word:string):string {
        return word.toLowerCase().match(/^.{2,15}/)[0];
    }

    d2h(d:number):string { // Convert to HEX
        return d.toString(16);
    }

    h2d(h:string):number { // Convert to Num
        return parseInt(h,16);
    }

    s2h(s: string):string { // String to HEX
        var cr:string = "";
        for (var i = 0; i < s.length; i++) cr = cr + this.d2h(s.charCodeAt(i));
        return cr;
    }

}
