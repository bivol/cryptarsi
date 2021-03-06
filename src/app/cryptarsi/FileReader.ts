import { log } from './log';
import { isIndexable } from './IsIndexable';
import { Config } from './Config';

export const allFileName = {
    name: Config.dbAllFileName,
    type: 'text/plain',
    icon: Config.dbAllFileIcon,
    size: 0,
    index: Config.dbAllFileIndex,
    group: Config.dbAllFileGroup
};

export const lonelyFileName = {
    name: Config.dbLonelyFileName,
    type: 'text/plain',
    icon: Config.dbLonelyFileIcon,
    size: 0,
    index: Config.dbLonelyFileIndex,
    group: Config.dbLonelyFileGroup
};

export class FileReaderAPI {
    constructor() {
    }

    readAll(files, cbfile = (f, text, obj?) => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }, cbprogress = (f, loaded, total, count?, totalcount?, clength?) => {
    }, description = '') {
        let me = this;
        return new Promise((resolve, reject) => {
            let total = 0;
            let loaded = 0;
            let cnt = 1;
            let q = [];
            let hash = {};
            let groups = {};
            let lonelyGroups = {};
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
                    lonelyGroups[gname] = 1;
                }
                if (isIndexable(file.type)) {
                    delete lonelyGroups[gname]; // Remove it from the list if it is indexable
                }
                let w = {
                    index: index,
                    type: file.type,
                    size: file.size,
                    name: file.name,
                    file: null,
                    group: gname
                };
                groups[gname].push(w);
                allfiles.push(w);
                w.file = file;
                hash[index] = Object.assign({}, w); // Copy the properties to avoid cyclic links
                nindex[file.name] = index;
                index++;
            }

            hash[allFileName.index] = Object.assign({}, allFileName);
            groups[hash[allFileName.index].group] = allfiles;

            hash[lonelyFileName.index] = Object.assign({}, lonelyFileName);
            groups[hash[lonelyFileName.index].group] = [];

            for (let g in lonelyGroups) {
                groups[hash[lonelyFileName.index].group] = groups[hash[lonelyFileName.index].group].concat(groups[g]);
            }

            groups[hash[allFileName.index].group] = groups[hash[allFileName.index].group].concat([Object.assign({}, allFileName), Object.assign({}, lonelyFileName)]);
            groups[hash[lonelyFileName.index].group] = groups[hash[lonelyFileName.index].group].concat([Object.assign({}, allFileName), Object.assign({}, lonelyFileName)]); // Add self reference

            for (let i in hash) { // Set the group index
                hash[i].gindex = groups[hash[i].group];
            }

            function processNextFile() {
                if (q.length === 0) {
                    //console.log('Lets add the last file');
                    return cbfile(Object.assign({}, lonelyFileName), lonelyFileName.name + '\n' + description, hash[lonelyFileName.index])
                        .then(() => {
                            //console.log('The lonely index file is added');
                            return cbfile(Object.assign({}, allFileName), allFileName.name + '\n' + description, hash[allFileName.index]);
                        })
                        .then(resolve)
                        .catch(reject);
                }
                let file = q.shift();
                me.readFile(file, (file, l, t) => {
                    log('file - 2', file.name, loaded, total);
                    if (cbprogress) {
                        cbprogress(file, loaded + l, total, cnt, files.length + 1, l);
                    }
                }).then((text) => {
                    log('File', file.name, 'loaded');
                    loaded += file.size;
                    cnt++;
                    if (cbfile) {
                        return cbfile(file, text, hash[nindex[file.name]]);
                    } else {
                        return; // Empty return still trigger the next then, so it acts like processNextFile
                    }
                }).then(() => processNextFile()).catch(reject);
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
                    log('file', file.name, d.loaded, d.total);
                    if (cb) {
                        cb(file, d.loaded, d.total);
                    }
                }
            };

            if (file.type === 'text/plain') {
                reader.readAsText(file, 'utf-8');
            } else if(file.type === 'application/pdf') {
               reader.readAsBinaryString(file); // To put there the text extraction code
               log('This is a PDF ',file);
            } else {
              reader.readAsBinaryString(file); // To verify
            }
        });
    }
}
