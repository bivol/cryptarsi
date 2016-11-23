import { FileReaderAPI } from './FileReader';
import { DB } from './Database';
import { WordHash } from './Hash';

export class ImportDir {
    store: DB = null;
    constructor(private dbName, private encKey) {
        this.store = new DB(dbName, encKey);
    }

    importFiles(files, progress = (f, loaded, total, count, totalcnt) => {

    }) {
        return new Promise((resolve, reject) => {
            let r = new FileReaderAPI();
            this.store.open().then(() => {
                console.log('Starting the import');
                let lastIndex = 0;
                r.readAll(files, (f, text, obj) => {
                    console.log('Downloaded', f.name, f.type, obj);
                    // let enc = this.crypto.encrypt(text);
                    lastIndex = Math.max(obj.index, lastIndex);
                    this.store.modifyData(obj.index, text)
                        .then(() => {
                            console.log('Successfuly imported', f, obj);
                            // Lets fix the index
                            let hashes = {};
                            WordHash.cbPerHash(text, (hash) => {
                                hashes[hash] = obj.index;
                            });
                            for (let hash in hashes) {
                                this.store.addIndexToHash(hash, obj.index)
                                    .then(() => {})
                                    .catch((e) => {
                                        console.log('Error inserting hash to index');
                                    });
                            };
                        })
                        .catch((e) => {
                            console.log('Error inserting', f, e, obj);
                        });
                }, (f, loaded, total, count, totalcnt) => {
                    if (progress) {
                        progress(f, loaded, total, count, totalcnt);
                    }
                }).then(() => {
                    this.store.setNextIndex(lastIndex)
                        .then(resolve)
                        .catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }
}
