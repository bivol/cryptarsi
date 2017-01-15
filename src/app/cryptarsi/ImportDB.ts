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
                //console.log('Starting the import');

                r.readAll(files, (f, text, obj) => {
                    //console.log('Downloaded', f.name, f.type, obj);
                    return new Promise((res, rej) => {
                        let tar = new Tar();
                        tar.readTar(text, (header, content, pos, total) => {
                            return new Promise((resolve, reject) => {
                                //console.log('tar callback', header, content.length, pos, total);
                                /*
                                if (header.fileName.match(/^i\//)) {
                                    let name = header.fileName.match(/^i\/(.+)/)[1];
                                    this.store.modifyRawHash(this.nameToIndex(name), content)
                                        .then(() => {
                                            progress(f, pos, total, 'Populate the database');
                                            resolve();
                                        })
                                        .catch(reject);
                                }
                                if (header.fileName.match(/^d\//)) {
                                    //console.log('d');
                                    let name = header.fileName.match(/^d\/(.+)/)[1];
                                    */
                                    let name = header.fileName;
                                    this.store.modifyRawData(this.nameToIndex(name), content)
                                        .then(() => {
                                            progress(f, pos, total, 'Populate the database');
                                            resolve();
                                        })
                                        .catch(reject);
                                // }
                            });
                        }).then(() => {
                            progress(f, 100, 100, 'Import completed');
                            res();
                        }).catch(rej);
                    });
                }, (f, loaded, total, count, totalcnt, l) => {
                    if (progress) {
                   // console.log('insert ok', f, pos, total);
                        progress(f, loaded, total, 'Downloading file');
                    }
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    }
}
