import { Crypto } from './CryptoAPI';
import { AngularIndexedDB } from './Storage';
import { WaitOK } from './WaitOK';

function createStoreInDb(db, version, name) {
    return new Promise((resolve, reject) => {
        console.log('Going to create store', db, version, name);
        db.createStore(version, (evt) => {
            function oneStore(n) {
                console.log('Creating non existing objStore', n);
                let obj = evt.currentTarget.result.createObjectStore(n, {
                    keyPath: 'id',
                    //autoIncrement: true
                });
                obj.onerror = (e) => {
                    console.log('Cannot create objectStore', e);
                    reject(e);
                };
            }
            if (name instanceof Array) {
                name.forEach(oneStore);
            } else {
                oneStore(name);
            }
        }).then(() => {
            console.log('No errors during creation/opening of', name);
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
                        console.log('Supposedly the store is ready');
                        resolve({});
                    }).catch(() => {
                        console.log('Some error has happened');
                        reject();
                    });
            });
        });
    }

    getDatabase(name) {
        return new Promise((resolve, reject) => {
            return this.listDb.getByKey(this.listStoreName, name)
        });
    }

    addDatabase(name) {
        return new Promise((resolve, reject) => {
            return this.listDb.add(this.listStoreName, { name: name, id: name })
                .catch((e) => {
                    if (e.target.error.code === 0) {
                        resolve();
                    } else {
                        reject();
                    }
                });
        });
    }

    dropDatabase(name) {
        return new Promise((resolve, reject) => {
            return this.listDb.delete(this.listStoreName, name )
        });
    }
}

let listReady = false;
let dbList: DatabaseList = new DatabaseList();
dbList.createListDb().then(() => { listReady = true; }).catch((e) => { console.log('Error', e); });

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
}

export class DB {
    private crypto;
    private store;

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
                console.log('Stores created');
                resolve();
            }).catch(reject);
        });
    }

    open() {
        return new Promise((resolve, reject) => {
            listOk().then(() => {
                console.log('Openning', this.dbName);
                this.createStores().then(() => {
                    console.log('Stores are ready, add it to the list', this.dbName);
                    dbList.addDatabase(this.dbName)
                        .then(resolve)
                        .catch(reject);
                }).catch(reject);
            });
        });
    }

    modifyData(index, content) {
        return new Promise((resolve, reject) => {
            let data = {
                id: this.crypto.encryptIndex(index),
                data: this.crypto.encrypt(content)
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
                data: this.crypto.encrypt(content)
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
                    resolve(this.crypto.decrypt((v && v.data) ? v.data : ''));
                })
                .catch(reject);
        });
    }

    addIndexToHash(hash, index) { // TODO: test for non existing index
        return new Promise((resolve, reject) => {
            this.getHash(hash)
                .then((data) => {
                    let ar = data.toString().split(',');
                    if (ar.indexOf(index.toString()) < 0) {
                        ar.push(index.toString());
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
                .then((data) => {
                    let ar = data.toString().split(',');
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
                console.log('getData for 0 is', data);
                let d = data ? data : 1;
                let next = parseInt(<string>d) + 1;
                console.log('d is', d, next);
                this.setNextIndex(next).then(() => resolve(d)).catch(reject);
            }).catch(reject);
        });
    }

    setNextIndex(index: number) {
        console.log('setnextindex', index);
        return this.modifyData(0, index + ' ');
    }
}
