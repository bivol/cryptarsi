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
                        tar.readTar(text, (header, content, pos, total) => {
                            return new Promise((resolve, reject) => {
                                if (header.fileName.match(/^i\//)) {
                                    let name = header.fileName.match(/^i\/(.+)/)[1];
                                    this.store.modifyRawHash(this.nameToIndex(name), content)
                                        .then(() => {
                                            progress(f, pos, total);
                                        })
                                        .catch(reject);
                                }
                                if (header.fileName.match(/^d\//)) {
                                    let name = header.fileName.match(/^d\/(.+)/)[1];
                                    this.store.modifyRawData(this.nameToIndex(name), content)
                                        .then(() => {
                                            progress(f, pos, total);
                                        })
                                        .catch(reject);
                                }
                            });
                        });
                        res();
                    });
                }, (f, loaded, total, count, totalcnt, l) => {
                    if (progress) {
                        progress(f, loaded, total);
                    }
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    }
}
