export class FileReaderAPI {
    constructor() {
    }

    read(files) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < files.length; i++) {
                console.log('name', files[i].name, files[i].type);
            }
            return resolve();
        });
    }
}
