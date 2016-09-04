/**
 * Created by delian on 8/30/16.
 */
import { Crypto } from './Crypto';
export declare class WordHash extends Crypto {
    hash(word: string): string;
    d2h(d: number): string;
    h2d(h: string): number;
    s2h(s: string): string;
}
