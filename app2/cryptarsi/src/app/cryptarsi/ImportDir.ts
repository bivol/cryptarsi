import { FileReaderAPI } from './FileReader';
import { DB } from './Database';
import { WordHash } from './Hash';
import { log } from '../log';

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
                log('Starting the import');
                let lastIndex = 0;
                let gTotal = 0;
                let gLoaded = 0;
                let gCount = 0;
                let gTotalcnt = 0;
                let gL = 0;

                r.readAll(files, (f, text, obj) => {
                    log('Downloaded', f.name, f.type, obj);
                    lastIndex = Math.max(obj.index, lastIndex);

                    return this.store.addFile(f, text, obj, (c) => {
                        // This is called in case of a progress. C will be between 0 and 1 (for 100%)
                        progress(f, (gLoaded - gL) * 3 + 2 * gL * c, gTotal * 3, gCount, gTotalcnt);
                    });
                }, (f, loaded, total, count, totalcnt, l) => {
                    if (progress) {
                        gTotal = total;
                        gLoaded = loaded;
                        gCount = count;
                        gTotalcnt = totalcnt;
                        gL = l;
                        progress(f, (loaded - l) * 3 + l, total * 3, count, totalcnt);
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
