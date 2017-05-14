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

    exportTar(name) {
        return new Promise((resolve, reject) => {
            let tar = new Tar();
            let file;
            let r = () => String.fromCharCode(Math.random() * 26 + 65);
            let suff = r() + r() + r() + r() + r() + r() + r();
            name = name.replace(/[^A-Za-z0-9]/g, '');
            let date = (new Date()).getTime();
            try {
                file = new FileWriterAPI(`cryptarsi.database.${name}.${date}.${suff}.tar`);
            } catch (e) {
                console.log('ERRRRRORR', e);
            }

            /*this.db.getAllKeys()
                .then(result => { console.log('All keys', result); resolve(); })
                .catch(reject);
                */

            /*
            this.db.getAllCbData(data => {
                console.log('Data cursor is', data);
                return new Promise((resolve, reject) => {
                    tar.addFile(this.stringToHex(atob(data.id)), data.data);
                    let p = new Promise((resolve, reject) => resolve());
                    p.then(resolve).catch(reject);
                });
            })
            .then(() => { console.log('Completed'); }).catch(() => {});
            return resolve();
            // */
            ///*
            file.createFile()
                .then(() => {
                    console.log('Now we shall have one empty file created. Retrieve chunks');
                    let c = 0;
                    return this.db.getAllByKeysCb(data => {
                        console.log('one data cursor is', data);
                        return new Promise((resolve2, reject2) => {
                            tar.addFile(this.stringToHex(atob(data.id)), data.data);
                            if (++c % 10) { return resolve2(); }
                            file.writeToFile(new Blob([tar.resetBuffer()], {type: 'application/octet-stream'}))
                                .then(resolve2).catch(reject2);
                        });
                    });
                })
                .then(() => {
                    console.log('The database export is completed and it is in in file', file);
                    return file.writeToFile(new Blob([tar.closingBuffer()], {type: 'application/octet-stream'}));
                })
                .then(() => {
                    // setTimeout(() => file.clear(), 1000); // Remove it from the cache
                    console.log('The file is closed. Exporting it');
                    resolve(file.url('application/tar')); // This has to point to the temporary file
                })
                .catch(e => {
                    console.log('Some kind of export error', e);
                    reject();
                });
            // */
        });
    }
}
