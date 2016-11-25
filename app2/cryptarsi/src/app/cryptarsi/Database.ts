import { Crypto } from './CryptoAPI';
import { AngularIndexedDB } from './Storage';
import { WaitOK } from './WaitOK';
import { WordHash } from './Hash';
import { log } from '../log';

function createStoreInDb(db, version, name) {
    return new Promise((resolve, reject) => {
        log('Going to create store', db, version, name);
        db.createStore(version, (evt) => {
            function oneStore(n) {
                log('Creating non existing objStore', n);
                let obj = evt.currentTarget.result.createObjectStore(n, {
                    keyPath: 'id',
                    //autoIncrement: true
                });
                obj.onerror = (e) => {
                    log('Cannot create objectStore', e);
                    reject(e);
                };
            }
            if (name instanceof Array) {
                name.forEach(oneStore);
            } else {
                oneStore(name);
            }
        }).then(() => {
            log('No errors during creation/opening of', name);
            resolve();
        }).catch(reject);
    });
}

class DatabaseList {
    private listDb;

    private listStoreName = 'list';
    private listDbName = 'dbList';
    private listVersion = 8;

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
                        log('Supposedly the store is ready');
                        resolve({});
                    }).catch(() => {
                        log('Some error has happened');
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

    private indexStoreName = 'index';
    private dataStoreName = 'data';
    private dataVersion = 1;

    constructor(private dbName, private encKey, private version = 8) {
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
        console.log('Called drop database', this.dbName);
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
            if (file.type === 'text/plain') {
                let hashes = {};
                WordHash.cbPerHash(content, (hash) => {
                    hashes[hash] = obj.index;
                });

                let data = 'XXXX' + JSON.stringify(obj) + 'XXXX\n' + content; // Metadata in every text file shall include the groups

                me.modifyData(obj.index, data)
                    .then(() => {
                        log('Successfuly imported, still need index', file, obj);
                        let hashQ = [];
                        progress(0.5);

                        for (let hash in hashes) { hashQ.push(hash); }
                        let hashQlen = hashQ.length;

                        function procHash() {
                            progress((hashQlen - hashQ.length) / (2 * hashQlen));
                            if (hashQ.length === 0) {
                                progress(1);
                                resolve();
                            }
                            let hash = hashQ.shift();
                            me.addIndexToHash(hash, obj.index)
                                .then(() => {
                                    log('Updated hash', hash, obj.index, file.name);
                                    //procHash();
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

    modifyData(index, content) {
        return new Promise((resolve, reject) => {
            let data = {
                id: this.crypto.encryptIndex(index),
                data: this.crypto.encrypt(content)
            };
            log('data...', this.dataStoreName, data);
            this.store.add(this.dataStoreName, data).then(resolve).catch((e) => {
                log('error add data', e);
                if (e.target.error.code === 0) { // Key duplication
                    this.store.update(this.dataStoreName, data)
                        .then(resolve).catch(reject);
                }
            });
        });
    }

    getData(index) {
        return new Promise((resolve, reject) => {
            this.store.getByKey(this.dataStoreName, this.crypto.encryptIndex(index))
                .then((v) => {
                    resolve(this.crypto.decrypt((v && v.data) ? v.data : ''));
                })
                .catch(reject);
        });
    }

    modifyHash(hash, content) {
        return new Promise((resolve, reject) => {
            let data = {
                id: this.crypto.encryptHash(hash),
                data: this.crypto.encrypt(content instanceof Array ? content.join(',') : content)
            };
            this.store.add(this.indexStoreName, data).then(resolve).catch((e) => {
                if (e.target.error.code === 0) { // Key duplication
                    this.store.update(this.indexStoreName, data)
                        .then(resolve).catch(reject);
                }
            });
        });
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

}
