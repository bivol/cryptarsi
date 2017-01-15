class FileWriterAPI {
    fs = null;
    constructor(private name = 'pesho', private size = 100000000) {
        window.requestFileSystem(
            window.TEMPORARY,
            size,
            (fs) => {
                this.fs = fs;
            },
            (e) => {
                console.log('ERROR file', e);
            }
        );
    }
}
