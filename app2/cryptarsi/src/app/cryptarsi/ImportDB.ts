import { FileReaderAPI } from './FileReader';
import { DB } from './Database';
import { Tar } from './Tar';

export class ImportDB {
    store: DB = null;

    constructor(private dbName) {
        this.store = new DB(dbName, 'XXXXXX'); // the key doesn't matter
    }

    importFile(files, progress = (f, loaded, total) => {

    }) {
        return new Promise((resolve, reject) => {
            let r = new FileReaderAPI();
            this.store.open().then(() => {
                console.log('Starting the import');

                r.readAll(files, (f, text, obj) => {
                    console.log('Downloaded', f.name, f.type, obj);
                    return new Promise((res, rej) => {
                        let tar = new Tar();
                        tar.readTar(text);
                        res();
                    });
                }, (f, loaded, total, count, totalcnt, l) => {
                    if (progress) {
                        progress(f, loaded, total);
                    }
                }).then(() => {
                    /*
                    this.store.setNextIndex(lastIndex)
                        .then(resolve)
                        .catch(reject);
                    */
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }
}
