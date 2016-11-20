import { Crypto } from './CryptoAPI';
import { AngularIndexedDB } from './Storage';

export class DB {
    private crypto;
    private store;

    private listDb;

    private indexStoreName = 'index';
    private dataStoreName = 'data';
    private listStoreName = 'list';
    private listDbName = 'dbList';
    private listVersion = 8;
    private hashName = 'hash';

    constructor(private dbName, private encKey, private version = 8) {
        this.crypto = new Crypto(encKey);
        this.store = new AngularIndexedDB(dbName, version);
        this.listDb = new AngularIndexedDB(this.listDbName, this.listVersion);
    }

    private createStoreInDb(db, version, name) {
        return new Promise((resolve, reject) => {
            console.log('Going to create store',db,version,name);
            db.createStore(version, (evt) => {
                console.log('EVT CSIDB');
                let obj = evt.currentTarget.result.createObjectStore(name, {
                    keyPath: 'id',
                    //autoIncrement: true
                })
                obj.onerror = (e) => {
                    console.log('Cannot create objectStore',e);
                }
            }).then(() => {
                console.log('No errors has been executed');
                resolve();
            }).catch(reject);
        })
    }

    createListDb() {
        return this.createStoreInDb(this.listDb, this.listVersion, this.listStoreName);
    }

    clearListDb() {
        return this.listDb.clear(this.listStoreName);
    }

    listDatabases() {
        return new Promise((resolve, reject) => {
            this.listDb.getAll(this.listStoreName).then((e) => {
                resolve(e);
            }).catch((e) => {
                console.log('listdb error',e,'create store will be called');
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
            this.listDb.getByKey(this.listStoreName, name)
                .then(resolve)
                .catch(reject);
        })
    }

    addDatabase(name) {
        return new Promise((resolve, reject) => {
            this.listDb.add(this.listStoreName, { name: name, id: name })
                .then(resolve)
                .catch(reject)
        })
    }

    dropDatabase(name) {
        return new Promise((resolve, reject) => {
            this.listDb.delete(this.listStoreName, name )
                .then(resolve)
                .catch(reject)
        })
    }

}