import { Crypto } from './CryptoAPI';
import { AngularIndexedDB } from './Storage';
import { WaitOK } from './WaitOK';
import { WordHash } from './Hash';
import { log } from '../log';
import { isIndexable, getHashList } from './IsIndexable';
import { Config } from './Config';

function createStoreInDb(db, version, name) {
    return new Promise((resolve, reject) => {
        log('Going to create store', db, version, name);
        db.createStore(version, (evt) => {
            function oneStore(n) {
               // log('Creating non existing objStore', n);
                let obj = evt.currentTarget.result.createObjectStore(n, {
                    keyPath: 'id',
                    //autoIncrement: true
                });
                obj.onerror = (e) => {
                  //  log('Cannot create objectStore', e);
                    reject(e);
                };
            }
            if (name instanceof Array) {
                name.forEach(oneStore);
            } else {
                oneStore(name);
            }
        }).then(() => {
           // log('No errors during creation/opening of', name);
            resolve();
        }).catch(reject);
    });
}

class DatabaseList {
    private listDb;

    private listStoreName = Config.listStoreName;
    private listDbName = Config.listDbName;
    private listVersion = Config.listVersion;

    constructor() {
        this.listDb = new AngularIndexedDB(this.listDbName, this.listVersion);
    }

    createListDb() {
        return createStoreInDb(this.listDb, this.listVersion, this.listStoreName);
    }

    clearListDb() {
        return this.listDb.clear(this.listStoreName);
    }

    listDatabases() {
        return new Promise((resolve, reject) => {
            this.listDb.getAll(this.listStoreName).then((e) => {
                resolve(e);
            }).catch((e) => {
                this.createListDb()
                    .then(() => {
                      //  log('Supposedly the store is ready');
                        resolve({});
                    }).catch(() => {
                       // log('Some error has happened');
                        reject();
                    });
            });
        });
    }

    getDatabase(name) {
        return new Promise((resolve, reject) => {
            this.listDb.getByKey(this.listStoreName, name).then(resolve).catch(reject);
        });
    }

    addDatabase(name) {
        return new Promise((resolve, reject) => {
            this.listDb.add(this.listStoreName, { name: name, id: name })
                .catch((e) => {
                    if (e.target.error.code === 0) {
                        resolve();
                    } else {
                        reject();
                    }
                }).then(resolve).catch(reject);
        });
    }

    dropDatabase(name) {
        return new Promise((resolve, reject) => {
            this.listDb.delete(this.listStoreName, name)
                .then(resolve).catch(reject);
        });
    }
}

let listReady = false;
let dbList: DatabaseList = new DatabaseList();
dbList.createListDb().then(() => { listReady = true; }).catch((e) => { log('Error', e); });

function listOk() {
    return WaitOK(() => {
        return listReady;
    });
}

export class DbList {

    databaseSelected = null;

    static ready() {
        return listReady;
    }

    static list() {
        return new Promise((resolve, reject) => {
            listOk().then(() => {
                return dbList.listDatabases();
            }).then(resolve).catch(reject);
        });
    }

    static isPresent(name) {
        return new Promise((resolve, reject) => {
            listOk().then(() => {
                log('Get db name', name);
                dbList.getDatabase(name).then((v) => {
                    log('isPresent, got', name, v);
                    if (v) {
                        resolve(v);
                    } else {
                        reject();
                    }
                }).catch(reject);
            }).catch(reject);
        });
    }
}

export class DB {
    private crypto;
    private store: AngularIndexedDB;

    private indexStoreName = Config.indexStoreName;
    private dataStoreName = Config.dataStoreName;
    private dataVersion = Config.dataVersion;
    private chunkSize = Config.fileChunkSize;

    constructor(private dbName, private encKey, private version = Config.listVersion) {
        this.crypto = new Crypto(encKey);
        this.store = new AngularIndexedDB(dbName, version);
    }


    private createStores() {
        return new Promise((resolve, reject) => {
            createStoreInDb(this.store,
                this.dataVersion,
                [this.indexStoreName, this.dataStoreName]
            ).then(() => {
                log('Stores created');
                resolve();
            }).catch(reject);
        });
    }

    open() {
        return new Promise((resolve, reject) => {
            listOk().then(() => {
                log('Openning', this.dbName);
                this.createStores().then(() => {
                    log('Stores are ready, add it to the list', this.dbName);
                    dbList.addDatabase(this.dbName)
                        .then(resolve)
                        .catch(reject);
                }).catch(reject);
            });
        });
    }

    // Drop database
    drop() {
        //console.log('Called drop database', this.dbName);
        return new Promise((resolve, reject) => {
            this.close().then(() => {
                this.store.drop()
                    .then(() => {
                        log('Going to remove it from the list');
                        dbList.dropDatabase(this.dbName)
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            });
        });
    }

    close() {
        return this.store.close();
    }

    addFile(file, content, obj, progress = (c) => {}) {
        return new Promise((resolve, reject) => {
            let me = this;
            if (isIndexable(file.type)) {
              //  console.log('Going to index', file.name, file.type, file);
                let hashQ = getHashList(file, content);
             //   console.log('HashQ is', hashQ);
              //  console.log('Obj is', obj);

                let data = 'XXXX' + JSON.stringify(obj) + 'XXXX\n' + content; // Metadata in every text file shall include the groups

                me.modifyData(obj.index, data)
                    .then(() => {
                        log('Successfuly imported, still need index', file, obj);
                        progress(0.5);
                        let d = new Date();
                        let hashQlen = hashQ.length;

                        function procHash() {
                            if ((<any>(new Date()) - <any>d) > 150) {
                                d = new Date();
                                progress(0.5 + (hashQlen - hashQ.length) / (2 * hashQlen));
                            }
                            if (hashQ.length === 0) {
                                progress(1);
                                return resolve();
                            }
                            let hash = hashQ.shift();
                            me.addIndexToHash(hash, obj.index)
                                .then(() => {
                                    log('Updated hash', hash, obj.index, file.name);
                                    procHash();
                                })
                                .catch((e) => {
                                    log('Error inserting hash to index');
                                });
                        }

                        procHash();

                    })
                    .catch((e) => {
                        log('Error inserting', file, e, obj);
                        reject(e);
                    });
            } else {
                me.modifyData(obj.index, content)
                    .then(() => {
                        log('Successfuly imported', file, obj);
                        progress(1);
                        resolve();
                    })
                    .catch((e) => {
                        log('Error inserting', file, e, obj);
                        reject(e);
                    });
            }
        });
    }

    modifyRawData(index, content) {
        return new Promise((resolve, reject) => {
            let data = {
                id: index,
                data: content
            };
            console.log('data...', this.dataStoreName, data);
            this.store.add(this.dataStoreName, data).then(resolve).catch((e) => {
                console.log('error add data', e);
                if (e.target.error.code === 0) { // Key duplication
                    this.store.update(this.dataStoreName, data)
                        .then(resolve).catch(reject);
                }
            });
        });
    }

    modifyLargeDataChunk(index, content, len) {
        if (index.toString().match(/\./)) { // This means we have secondary chunk
            return this.modifyRawData(
                this.crypto.encryptIndex(index.toString()),
                this.crypto.encrypt(content));
        }
        return this.modifyRawData(
            this.crypto.encryptIndex(index.toString()),
            this.crypto.encrypt(
                'YYYYY' + parseInt((len / this.chunkSize).toString(), 10).toString() + 'YYYYY'
                    + content
            )
        );
    }

    modifyData(index, content) {
        /*
        console.log('DUMP INDEX', index, 'CONTENT', content);
        let ds = (t) => { let s = ''; for (let i = 0; i < t.length; i++) { s += t.charCodeAt(i) + ' '; }; return s; };
        console.log('CHARS ', ds(content));
        let e = this.crypto.decrypt(this.crypto.encrypt(content));
        console.log('TROUGH ENCRYPTOR ', ds(e));
        */

        if (content.length > this.chunkSize) {
            return new Promise((resolve, reject) => {
                let i = 0;
                let proc = () => {
                    console.log('Add in chunks',
                        index.toString() + (Math.sign(i) ? '.' + i.toString() : ''),
                        i,
                        content.length
                    );
                    if (i * this.chunkSize + this.chunkSize >= content.length) {
                        return this.modifyLargeDataChunk(
                            index.toString() + '.' + i.toString(),
                            content.substr(i * this.chunkSize, this.chunkSize),
                            content.length
                        ).then(resolve).catch(reject);
                    };
                    this.modifyLargeDataChunk(
                        index.toString() + (Math.sign(i) ? '.' + i.toString() : ''),
                        content.substr(i * this.chunkSize, this.chunkSize),
                        content.length
                    ).then(() => {
                        i++;
                        proc();
                    }).catch(reject);
                };
                proc();
            });
        } else {
            return this.modifyRawData(this.crypto.encryptIndex(index),
                this.crypto.encrypt(content));
        }
    }

    getData(index) {
        return new Promise((resolve, reject) => {
            this.store.getByKey(this.dataStoreName, this.crypto.encryptIndex(index))
                .then((v) => {
                    let data = this.crypto.decrypt((v && v.data) ? v.data : '');
                    if (data && data.match(/^YYYYY[0-9]+YYYYY/)) {
                        let size = data.match(/^YYYYY([0-9]+)YYYYY/)[1];
                        data = data.replace(/^YYYYY[0-9]+YYYYY/, '');
                        let i = 1;
                        let proc = () => {
                            if (i > size) {
                                return resolve(data);
                            }
                            this.store.getByKey(this.dataStoreName, this.crypto.encryptIndex(index + '.' + i))
                                .then((v1) => {
                                    let d = this.crypto.decrypt((v1 && v1.data) ? v1.data : '');
                                    data += d;
                                    i++;
                                    proc();
                                })
                                .catch(reject);
                        };
                        proc();
                    } else {
                        resolve(data);
                    }
                })
                .catch(reject);
        });
    }

    modifyRawHash(hash, content) {
        return new Promise((resolve, reject) => {
            let data = {
                id: hash,
                data: content
            };
            this.store.add(this.indexStoreName, data).then(resolve).catch((e) => {
                if (e.target.error.code === 0) { // Key duplication
                    this.store.update(this.indexStoreName, data)
                        .then(resolve).catch(reject);
                }
            });
        });
    }

    modifyHash(hash, content) {
        return this.modifyRawHash(this.crypto.encryptHash(hash),
            this.crypto.encrypt(content instanceof Array ? content.join(',') : content));
    }

    getHash(hash) {
        return new Promise((resolve, reject) => {
            this.store.getByKey(this.indexStoreName, this.crypto.encryptHash(hash))
                .then((v) => {
                  log('getHash then', v);
                    if (v && v.data) {
                        let out = this.crypto.decrypt(v.data).split(',');
                        log('getHash out', out);
                        if (out.indexOf('') >= 0) {
                            out.splice(out.indexOf(''), 1); // TODO: find why we have empty element
                        }
                        resolve(out);
                    } else {
                        resolve([]);
                    }
                })
                .catch(reject);
        });
    }

    getWordHash(word) {
        log('getWordHash', word, WordHash.hash(word));
        return this.getHash(WordHash.hash(word));
    }

    addIndexToWordHash(word, index) {
        log('addIndexToWordHash', word, WordHash.hash(word));
        return this.addIndexToHash(WordHash.hash(word), index);
    }

    addIndexToHash(hash, index) { // TODO: test for non existing index
        return new Promise((resolve, reject) => {
            log('addIndexToHash, index is', index, hash);
            if (!index) {
                return resolve();
            }
            this.getHash(hash)
                .then((ar: any[]) => {
                    if (ar.indexOf(index.toString()) < 0) {
                        ar.push(index.toString());
                        log('Index is added to hash', index, hash, ar);
                        this.modifyHash(hash, ar.join(','))
                            .then(resolve)
                            .catch(reject);
                    } else {
                        resolve();
                    }
                })
                .catch(reject);
        });
    }

    removeIndexFromHash(hash, index) {
        return new Promise((resolve, reject) => {
            this.getHash(hash)
                .then((ar: any[]) => {
                    if (ar.indexOf(index.toString()) >= 0) {
                        ar.splice(ar.indexOf(index.toString()), 1);
                        this.modifyHash(hash, ar.join(','))
                            .then(resolve)
                            .catch(reject);
                    } else {
                        resolve();
                    }
                })
                .catch(reject);
        });
    }

    getNextIndex() { // TODO: Better method to keep it in order
        return new Promise((resolve, reject) => {
            this.getData(0).then((data) => {
                log('getData for 0 is', data);
                let d = data ? data : 1;
                let next = parseInt(<string>d) + 1;
                log('d is', d, next);
                this.setNextIndex(next).then(() => resolve(d)).catch(reject);
            }).catch(reject);
        });
    }

    setNextIndex(index: number) {
        log('setnextindex', index);
        return this.modifyData(0, index + ' ');
    }

    getAllIndexes() {
        return this.store.getAll(this.indexStoreName);
    }

    getAllData() {
        return this.store.getAll(this.dataStoreName);
    }

    getAllCbIndexes(cb) {
        return this.store.getAllCb(this.indexStoreName, cb);
    }

    getAllCbData(cb) {
        return this.store.getAllCb(this.dataStoreName, cb);
    }

}
