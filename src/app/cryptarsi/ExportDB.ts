import { DB } from './Database';
import { Tar } from './Tar';
import { FileWriterAPI } from './FileWriter';

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
            let file;
            try {
                file = new FileWriterAPI('cryptarsi.2.database.tar');
            } catch (e) {
                console.log('ERRRRRORR', e);
            }
            this.db.getAllCbData((data) => {
                console.log('one data cursor is', data);
                return new Promise((resolve2, reject2) => {
                    tar.addFile(this.stringToHex(atob(data.id)), data.data);
                    file.writeToFile(new Blob([tar.resetBuffer()], {type: 'application/octet-stream'}))
                        .then(resolve2).catch(reject2);
                });
            }).then(() => {
                console.log('Indexes are in file with length', file);
                return file.writeToFile(new Blob([tar.closingBuffer()], {type: 'application/octet-stream'}))
                    .then(() => {
                        resolve(file.url('application/tar')); // This has to point to the temporary file
                    });
            }).catch(reject);
        });
    }
}
