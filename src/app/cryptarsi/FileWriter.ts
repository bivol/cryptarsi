export function isFileWriterSupported() {
    let requestFS = window['requestFileSystem'] || window['webkitRequestFileSystem'];
    return typeof requestFS !== 'undefined';
}

export class FileWriterAPI {
    fs = null;
    file = null;
    constructor(private name = 'pesho', private size = 100000000) {
        // Follows a little hack to escape from tslint strick checking
        let requestFS = window['requestFileSystem'] || window['webkitRequestFileSystem'];
        let TEMPORARY = window['TEMPORARY'] || 0;
        // window.webkitRequestFileSystem(window.TEMPORARY, 10000000000, (file) => console.log(file), (e) => console.log('Error',e))
        requestFS(
            TEMPORARY,
            this.size,
            (fs) => {
                console.log('Granted temp file access', fs);
                this.fs = fs;
            },
            (e) => {
                console.log('ERROR file', e);
            }
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
