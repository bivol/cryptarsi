import { DB } from './Database';
import { Tar } from './Tar';

export class ExportDB {
    constructor(private db: DB) {
    }

    padString(prefix, s, totalchars) {
        return prefix.substring(0, totalchars - s.length) + s;
    }

    stringToHex(s: string) {
        let out = '';
        for (let i = 0; i < s.length; i++) {
            out += this.padString("00", s.charCodeAt(i).toString(16), 2);
        }
        return out;
    }

    hexToString(h) {
        // TODO: implement it
    }

    exportTar() {
        return new Promise((resolve, reject) => {
            let tar = new Tar();
            let buffer;

            this.db.getAllCbIndexes((data) => {
              //  console.log('one index cursor is', data);
                return new Promise((resolve2, reject2) => {
                    buffer = tar.addFile('i/' + this.stringToHex(atob(data.id)), data.data);
                    resolve2();
                });
            }).then(() => {
                this.db.getAllCbData((data) => {
                    //console.log('one data cursor is', data);
                    return new Promise((resolve2, reject2) => {
                        buffer = tar.addFile('d/' + this.stringToHex(atob(data.id)), data.data);
                        resolve2();
                    });
                }).then(() => {
<<<<<<< Updated upstream
                    //console.log('Indexes are in buffer with length', buffer, buffer.length);
=======
                    //console.log('Indexes are in buffer with length', buffer.length);
>>>>>>> Stashed changes
                    resolve(new Blob([buffer], { type: 'application/tar' }));
                }).catch(reject);
            }).catch(reject);
        });
    }

}
