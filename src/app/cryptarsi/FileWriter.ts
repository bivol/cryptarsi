export function isFileWriterSupported() {
    let requestFS = window['requestFileSystem'] || window['webkitRequestFileSystem'];
    return typeof requestFS !== 'undefined';
}

export class FileWriterAPI {
    fs = null;
    file = null;
    constructor(private name = 'pesho', private size = 1024 * 1024) {
        /*
        // Follows a little hack to escape from tslint strick checking
        //let requestQuota = navigator['temporaryStorage'] || navigator['webkitTemporaryStorage'];
        //requestQuota = requestQuota.requestQuota.bind(navigator);
        let requestFS = (window['requestFileSystem'] || window['webkitRequestFileSystem']).bind(window);
        let TEMPORARY = window['TEMPORARY'] || 0;
        // window.webkitRequestFileSystem(window.TEMPORARY, 10000000000, (file) => console.log(file), (e) => console.log('Error',e))
        //requestQuota(this.size, bytes => {
        (navigator['temporaryStorage'] || navigator['webkitTemporaryStorage']).requestQuota(this.size, bytes => {
            console.log('Quota is given', bytes);
        (window['requestFileSystem'] || window['webkitRequestFileSystem'])(
                TEMPORARY,
                bytes,
                (fs) => {
                    console.log('Granted temp file access', fs);
                    this.fs = fs;
                },
                (e) => {
                    console.log('ERROR file', e);
                }
            );
        }, e => console.log('Request Quota Error', e));
        */
        console.log('Requesting quota', navigator, window);
        navigator['webkitTemporaryStorage'].queryUsageAndQuota(
            (used, total) => console.log('Quota used', used, 'total', total),
            error => console.log('Usage error', error)
        );
        navigator['webkitTemporaryStorage'].requestQuota(
            this.size,
            bytes => {
                console.log('Quota granted', bytes);
                window['webkitRequestFileSystem'](
                    window['TEMPORARY'],
                    bytes,
                    fs => {
                        console.log('Got file system', fs);
                        this.fs = fs;
                    },
                    error => console.log('Filesystem error', error)
                );
            },
            error => console.log('Request Quota Error', error)
        );
    }

    createFile(name?: string) {
        let my = this;
        if (name) {
            my.name = name;
        }
        return new Promise((resolve, reject) => {
            let count = 50;
            function exec() {
                if (count < 0) {
                    return reject();
                }
                if (my.fs) {
                    console.log('We have fs, lets try to get a file', my.fs);
                    my.fs.root.getFile(my.name, { create: true }, (file) => {
                        my.file = file;
                        return resolve();
                    }, (e) => {
                        console.log('Error creating file', e);
                        reject(e);
                    });
                } else {
                    console.log('No fs descriptor, retry');
                    count--;
                    setTimeout(exec, 250); // Retry again in a while
                }
            }
            exec();
        });
    }

    writeToFile(data: Blob) { // Data is of type Blob
        let my = this;
        return new Promise((resolve, reject) => {
            if (!my.file) {
                console.log('No file descriptor, try to create');
                my.createFile().then(() => {}).catch(() => reject());
            }
            let count = 50;
            function exec() {
                if (count < 0) {
                    return reject();
                }
                if (my.file) {
                    my.file.createWriter((writer) => {
                        writer.onerror = (e) => reject(e);
                        writer.onwriteend = () => resolve();
                        writer.seek(writer.length);
                        writer.write(data);
                    }, (e) => reject(e));
                } else {
                    count--;
                    setTimeout(exec, 250); // Retry again in a while
                }
            }
            exec();
        });
    }

    url(mimetype?) {
        if (this.file) {
            return this.file.toURL(mimetype);
        }
        return '';
    }
}
