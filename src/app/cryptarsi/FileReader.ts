import { log } from '../log';

export class FileReaderAPI {
    constructor() {
    }

    readAll(files, cbfile = (f, text, obj?) => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }, cbprogress = (f, loaded, total, count?, totalcount?, clength?) => {
    }) {
        let me = this;
        return new Promise((resolve, reject) => {
            let total = 0;
            let loaded = 0;
            let cnt = 1;
            let q = [];
            let hash = {};
            let groups = {};
            let nindex = {};
            let index = 1;
            for (let file of files) {
                total += parseInt(file.size);
                q.push(file);
                let gname = file.name.match(/^(.*?)(\.[^\.]+)?$/)[1]; // Without the last extension
                if (typeof groups[gname] === 'undefined') {
                    groups[gname] = [];
                }
                groups[gname].push({
                    index: index,
                    type: file.type,
                    size: file.size,
                    name: file.name
                });
                let v = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    index: index,
                    file: file,
                    group: gname
                };
                hash[index] = v;
                nindex[file.name] = index;
                index++;
            }

            for (let i in hash) { // Set the group index
                hash[i].gindex = groups[hash[i].group];
            }

            function processNextFile() {
                if (q.length === 0) {
                    return resolve();
                }
                let file = q.shift();
                me.readFile(file, (file, l, t) => {
                    // log('file - 2', file.name, loaded, total);
                    if (cbprogress) {
                        cbprogress(file, loaded + l, total, cnt, files.length, l);
                    }
                }).then((text) => {
                    // log('File', file.name, 'loaded');
                    loaded += file.size;
                    cnt++;
                    if (cbfile) {
                        cbfile(file, text, hash[nindex[file.name]])
                            .then(() => {
                                processNextFile();
                            })
                            .catch(reject);
                    } else {
                        processNextFile();
                    }
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
                    // log('file', file.name, d.loaded, d.total);
                    if (cb) {
                        cb(file, d.loaded, d.total);
                    }
                }
            };

            if (file.type === 'text/plain') {
                reader.readAsText(file, 'utf-8');
            } else {
                reader.readAsBinaryString(file); // To verify
            }
        });
    }
}
