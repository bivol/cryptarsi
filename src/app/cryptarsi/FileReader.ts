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
            let allfiles = [];
            let nindex = {};
            let index = 3;
            for (let file of files) {
                //console.log('File name is', file);
                if (file.name.match(/^\./)) {
                    continue; // We ignore filenames that begin with .
                }
                total += parseInt(file.size);
                q.push(file);
                let name = file.webkitRelativePath || file.mozFullPath || file.name;
                let gname = name;
                if (name.match(/([^\/\\]*[\/\\]){2}/)) {
                    gname = name.match(/^(.*?)(\\[^\\]*|\/[^\/]*|\@.*|(\.[^\.]+)?)$/)[1]; // Without the last extension
                } else {
                    gname = name.match(/^(.*?)(\@.*|(\.[^\.]+)?)$/)[1]; // Without the last extension
                }
                if (typeof groups[gname] === 'undefined') {
                    groups[gname] = [];
                }
                let w = {
                    index: index,
                    type: file.type,
                    size: file.size,
                    name: file.name
                };
                groups[gname].push(w);
                allfiles.push(w);
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

            hash[1] = {
                name: 'Cryptarsi All Files',
                type: 'text/plain',
                size: 0,
                index: 1,
                group: 'Cryptarsi All Files'
            };
            groups[hash[1].group] = allfiles;

            hash[2] = {
                name: 'Cryptarsi Lonely Files',
                type: 'text/plain',
                size: 0,
                index: 2,
                group: 'Cryptarsi Lonely Files'
            };
            groups[hash[2].group] = [];

            for (let g in groups) {
                if (g.length === 1
                    && groups[g][0].type !== 'text/plain'
                    && g !== hash[2].group
                    && g !== hash[1].group
                ) {
                    groups[hash[2].group].push(groups[g][0]);
                }
            }

            for (let i in hash) { // Set the group index
                hash[i].gindex = groups[hash[i].group];
            }

            function processNextFile() {
                if (q.length === 0) {
                    console.log('Lets add the last file');
                    return cbfile({
                        name: 'Cryptarsi Lonely Files',
                        type: 'text/plain',
                        size: 0
                    }, 'Cryptarsi Lonely Files', hash[2]).then(() => {
                        console.log('The lonely index file is added');
                        cbfile({
                            name: 'Cryptarsi All Files',
                            type: 'text/plain',
                            size: 0
                        }, 'Cryptarsi All Files', hash[1]).then(() => {
                            console.log('The index file is added');
                            resolve();
                        }).catch(reject);
                    }).catch(reject);
                }
                let file = q.shift();
                me.readFile(file, (file, l, t) => {
                    // log('file - 2', file.name, loaded, total);
                    if (cbprogress) {
                        cbprogress(file, loaded + l, total, cnt, files.length + 1, l);
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
