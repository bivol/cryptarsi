import { FileReaderAPI } from './FileReader';
import { DB } from './Database';
import { Tar } from './Tar';

export class ImportDB {
    store: DB = null;

    constructor(private dbName) {
        this.store = new DB(dbName, 'XXXXXX'); // the key doesn't matter
    }

    nameToIndex(name) {
        return btoa(name.replace(/[0-9a-f]{2}/gi, (m) => String.fromCharCode(parseInt(m, 16))));
    }

    importFile(files, progress = (f, loaded, total, status) => {

    }) {
        return new Promise((resolve, reject) => {
            let r = new FileReaderAPI();
            this.store.open().then(() => {
                console.log('Starting the import');
                let tar = new Tar();

                return r.readFileChunks(files[0], (f, loaded, total, text) => {
                    console.log('Downloaded', f.name, f.type, loaded, total, 100 * loaded / total);
                    return new Promise((res, rej) => {
                        tar.readTar(text, (header, content, pos, bufLen) => {
                            return new Promise((resolve, reject) => {
                                console.log('From tar got file', header);
                                    let name = header.fileName;
                                    this.store.modifyRawData(this.nameToIndex(name), content)
                                        .then(() => {
                                            progress(f, loaded + pos, total, 'Populate the database');
                                            resolve();
                                        })
                                        .catch(reject);
                            });
                        }).then(() => {
                            // Nothing to do
                            res();
                        }).catch(rej);
                    });
                });
            })
            .then(() => {
                progress({}, 100, 100, 'Import completed');
                resolve();
            })
            .catch(reject);
        });
    }
}
