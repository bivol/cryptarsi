import { FileReaderAPI } from './FileReader';
import { Crypto } from './CryptoAPI';

export class ImportDir {
    private crypto;
    constructor(private dbName, private encKey) {
        this.crypto = new Crypto(encKey);
    }

    importFiles(files, progress = (f, loaded, total, count, totalcnt) => {

    }) {
        return new Promise((resolve, reject) => {
            let r = new FileReaderAPI();
            r.readAll(files, (f, text, obj) => {
                console.log('Downloaded', f.name, f.type, obj);
                let enc = this.crypto.encrypt(text);
            }, (f, loaded, total, count, totalcnt) => {
                if (progress) {
                    progress(f, loaded, total, count, totalcnt);
                }
            }).then(resolve).catch(reject);
        })
    }
}
