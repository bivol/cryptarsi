/*
 * Jen is a portable password generator using cryptographic approach
 * Copyright (C) 2015  Michael VERGOZ @mykiimike
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

class JenFailsafe {
    getRandomValues(buffer: Uint8Array): Uint8Array {
        if (!(buffer instanceof Uint8Array)) {
            buffer = new Uint8Array(256);
        }
        let rd = 0;
        for (let a = 0; a < buffer.length; a++) {
            while (1) {
                rd = Math.round(Math.random() * 256);
                if (rd >= 0 && rd <= 255) {
                    break;
                }
            }
            buffer[a] = rd;
        }
        return(buffer);
    }
};

export class Jen {
    dump: Uint8Array;
    mode: string = '';
    version: string = '1.0.6-dev';
    crypto: any;
    _time: number;

    constructor(public hardened = false) {
        this.dump = new Uint8Array(256);
        this.mode = '';
        this.version = '1.0.6-dev';
        this.crypto = window.crypto;
        if (window.crypto) {
            this.mode = 'W3C CryptoAPI';
            this.crypto = window.crypto;
        }
        if (!this.crypto) {
            this.mode = 'Failsafe';
            this.crypto = JenFailsafe;
        }
    }

    engine(): string {
        return (this.mode);
    }

    fill(): void {
        this.crypto.getRandomValues(this.dump);
    }

    randomBytes(size: number): Uint8Array {
        if (size <= 0) {
            size = 1;
        }

        let r = new Uint8Array(size);
        this.crypto.getRandomValues(r);
        return(r);
    }

    random(size: number): number {
        if (size <= 0) {
            size = 4;
        } else if (size > 2) {
            size = 4;
        }

        let d = this.randomBytes(size);

        let dv = new DataView(d.buffer), r;
        if (size === 1) {
            r = dv.getUint8(0);
        } else if (size === 2) {
            r = dv.getUint16(0);
        } else {
            r = dv.getUint32(0);
        }

        return(r);
    }

    randomBetween(max: number, min: number): number {
        if (max <= 0) { max = Math.pow(2, 32); }
        if (!min) { min = 0; }
        if (min >= max) { return (NaN); }
        let size = 1;
        let ml2 = Math.log(max) / Math.log(2);
        if (ml2 > 16) {
            size = 4;
        } else if (ml2 > 8) {
            size = 2;
        }
        let num;
        do {
            num = this.random(size);
        } while (num > max || num < min);
        return(num);
    }

    hardening(bool: boolean): void {
        this.hardened = !!bool;
    }

    password(min: number, max: number, regex: RegExp = null): string {
        let start = new Date().getTime();
        min = min < 1 ? 1 : min;
        max = max > min ? max : min;
        let b = 0, ret = '';
        let cur = max;

        if (min !== max) {
            cur = 0;
            let nBi = Math.ceil(Math.log(max) / Math.log(2)),
                nBy = Math.ceil(nBi / 8), nByBi = nBy * 8;
            while (cur === 0) {
                let r = this.random(nBy) >> (nByBi-nBi);
                if (r >= min && r <= max) {
                    cur = r;
                    break;
                }
            }
        }

        b = 0;
        while (b < cur) {
            this.fill();
            let array = this.dump;
            for (let a = 0; a < array.length && b < cur; a++) {
                if (
                    (array[a] >= 0x30 && array[a] <= 0x39) ||
                    (array[a] >= 0x41 && array[a] <= 0x5a) ||
                    (array[a] >= 0x61 && array[a] <= 0x7a)) {
                    if (regex) {
                        if (regex.test(String.fromCharCode(array[a]))) {
                            ret += String.fromCharCode(array[a]);
                            b++;
                        }
                    } else {
                        ret += String.fromCharCode(array[a]);
                        b++;
                    }
                } else if (this.hardened === true && (
                        array[a] == 0x21 ||
                        array[a] == 0x23 ||
                        array[a] == 0x25 ||
                        (array[a] == 0x28 && array[a] <= 0x2f) ||
                        (array[a] == 0x3a && array[a] <= 0x40)
                    )) {
                    if (regex) {
                        if (regex.test(String.fromCharCode(array[a]))) {
                            ret += String.fromCharCode(array[a]);
                            b++;
                        }
                    } else {
                        ret += String.fromCharCode(array[a]);
                        b++;
                    }
                }
            }
        }
        this.fill();
        this._time = new Date().getTime() - start;
        return(ret);
    }

    stats(min: number, max: number, regex: RegExp) {
        return (this._time);
    }
}
