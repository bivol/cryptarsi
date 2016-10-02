/**
 * Created by delian on 8/30/16.
 */

export class WordHash {
    static hash(word:string):string {
        return word.toLowerCase().match(/^.{2,15}/)[0];
    }

    static d2h(d:number):string { // Convert to HEX
        return d.toString(16);
    }

    static h2d(h:string):number { // Convert to Num
        return parseInt(h,16);
    }

    static s2h(s: string):string { // String to HEX
        var cr:string = "";
        for (var i = 0; i < s.length; i++) cr = cr + this.d2h(s.charCodeAt(i));
        return cr;
    }
}
