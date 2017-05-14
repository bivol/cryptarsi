export class Config {
    static fileChunkSize = 10000000;
    static maxFileSize = 1000000000;
    static fileBlobChunks = 10; // We use FileWriterAPI if supported if we have a file with more than this amount of chunks
    static listStoreName = 'list';
    static listDbName = 'dbList';
    static listVersion = 8;
    static indexStoreName = 'data'; // was index
    static dataStoreName = 'data';
    static dataVersion = 1;
    static cryptoHashSuffix = '.hash';
    static cryptoIndexSuffix = '.idx';
    static cryptoAesKeySize = 256 / 32;
    static dbAllFileName = 'Cryptarsi All Files';
    static dbAllFileIndex = 1;
    static dbAllFileIcon = 'format_list_numbered';
    static dbAllFileGroup = 'Cryptarsi All Files';
    static dbLonelyFileName = 'Cryptarsi Lonely Files';
    static dbLonelyFileIndex = 2;
    static dbLonelyFileIcon = 'format_list_bulleted';
    static dbLonelyFileGroup = 'Cryptarsi Lonely Files';
    static waitTime = 100;
    static waitRetry = 50;
};
