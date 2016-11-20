import { Crypto } from './CryptoAPI';
import { AngularIndexedDB } from './Storage';

function createStoreInDb(db, version, name) {
    return new Promise((resolve, reject) => {
        console.log('Going to create store',db,version,name);
        db.createStore(version, (evt) => {
            function oneStore(name) {
                console.log('Creating non existing objStore', name);
                let obj = evt.currentTarget.result.createObjectStore(name, {
                    keyPath: 'id',
                    //autoIncrement: true
                })
                obj.onerror = (e) => {
                    console.log('Cannot create objectStore', e);
                    reject(e);
                }
            }
            if (name instanceof Array) {
                name.forEach(oneStore) 
            } else {
                oneStore(name)
            }
        }).then(() => {
            console.log('No errors during creation/opening of', name);
            resolve();
        }).catch(reject);
    })
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
                    .then(()=>{
                        console.log('Supposedly the store is ready');
                        resolve({});
                    }).catch(() => {
                        console.log('Some error has happened');
                        reject();
                    });
            })
        });
    }

    getDatabase(name) {
        return new Promise((resolve, reject) => {
            return this.listDb.getByKey(this.listStoreName, name)
        })
    }

    addDatabase(name) {
        return new Promise((resolve, reject) => {
            return this.listDb.add(this.listStoreName, { name: name, id: name })
        })
    }

    dropDatabase(name) {
        return new Promise((resolve, reject) => {
            return this.listDb.delete(this.listStoreName, name )
        })
    }
}

var listReady: boolean = false;
var dbList: DatabaseList = new DatabaseList();
dbList.createListDb().then(() => {
    listReady = true;
    console.log('Modifying listReady', listReady);
}).catch((e) => {
    console.log('Error', e);
});

function Ok(f: any, wait: number = 100, retry: number = 50) {
    return new Promise((resolve, reject) => {
        let count = retry;
        function check() {
            if (f()) {
                return resolve();
            }
            if (--count>0) {
                console.log('Not ready, wait', f());
                setTimeout(check, wait)
            } else {
                return reject(); 
            }
        }
        check();
    });
}

function listOk() {
    return Ok(() => {
        return listReady
    })
}

export class DbList {
    constructor() {

    }

    static ready() {
        return listReady;
    }

    static list() {
        return new Promise((resolve, reject) => {
            listOk().then(() => {
                return dbList.listDatabases()
            }).then(resolve).catch(reject)
        })
    }
}

export class DB {
    private crypto;
    private store;

    private indexStoreName = 'index';
    private dataStoreName = 'data';
    private hashName = 'hash';
    private dataVersion = 1;

    constructor(private dbName, private encKey, private version = 8) {
        this.crypto = new Crypto(encKey);
        this.store = new AngularIndexedDB(dbName, version);
    }


    private createStores() {
        return new Promise((resolve, reject) => {
            return createStoreInDb(this.store,
                this.dataVersion,
                [this.indexStoreName, this.dataStoreName]
            )
        })
    }

    open() {
        return new Promise((resolve, reject) => {
            return this.createStores()
        })
    }

}