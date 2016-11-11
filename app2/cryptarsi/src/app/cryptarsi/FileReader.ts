export class FileReaderAPI {
    constructor() {
    }

    readAll(files, cbfile = (f, text) => {
    }, cbprogress = (f, loaded, total, count?, totalcount?) => {
    }) {
        let me = this;
        return new Promise((resolve, reject) => {
            let total = 0;
            let loaded = 0;
            let cnt = 1;
            let q = [];
            for (let file of files) {
                total += parseInt(file.size);
                q.push(file);
            }

            function processNextFile() {
                if (q.length === 0) {
                    return resolve();
                }
                let file = q.shift();
                me.readFile(file, (file, l, t) => {
                    console.log('file - 2', file.name, loaded, total);
                    if (cbprogress) {
                        cbprogress(file, loaded + l, total, cnt, files.length);
                    }
                }).then((text) => {
                    console.log('File', file.name, 'loaded');
                    loaded += file.size;
                    cnt++;
                    if (cbfile) {
                        cbfile(file, text);
                    }
                    processNextFile();
                }).catch(reject);
            }

            processNextFile();
        });
    }

    readFile(file, cb = (f, loaded, total) => {} ) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader;
            reader.onload = (e) => {
                let text = reader.result;
                resolve(text);
            };
            reader.onerror = reject;
            reader.onabort = reject;

            reader.onprogress = (d) => {
                if (d.lengthComputable) {
                    console.log('file', file.name, d.loaded, d.total);
                    if (cb) {
                        cb(file, d.loaded, d.total);
                    }
                }
            };

            reader.readAsText(file, 'utf-8');
        });
    }
}
