import { Injectable } from '@angular/core';
import { DB, DbList } from '../cryptarsi/Database';
import { log } from '../cryptarsi/log';

log('AppDbService instanciated');

interface DbElement {
    encKey: string;
    db: DB;
}

@Injectable()
export class AppDbService {
    private _dbList = {};

    constructor() {
    }

    list() {
        return DbList.list();
    }

    isPresent(name) {
        return DbList.isPresent(name);
    }

    // TODO: Write this better
    open(name: string, key: string): Promise<DB> {
        return new Promise((resolve, reject) => {
            if (this._dbList[name]) {
                if (this._dbList[name].encKey === key) {
                    return resolve(this._dbList[name].db);
                }
                return this.close(name)
                    .then(() => this.open(name, key))
                    .then(resolve)
                    .catch(reject);
            }
            let db = new DB(name, key);
            this._dbList[name] = <DbElement>{
                encKey: key,
                db: db
            };
            db.open()
                .then(() => resolve(db))
                .catch(reject);
        });
    }

    close(name: string) {
        return new Promise((resolve, reject) => {
            if (this._dbList[name]) {
                this._dbList[name].db.close()
                    .then(() => {
                        delete this._dbList[name];
                        resolve();
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }

    drop(name: string) {
        return new Promise((resolve, reject) => {
            if (this._dbList[name]) { // Close it first
                return this.close(name)
                    .then(() => this.drop(name))
                    .then(resolve)
                    .catch(reject);
            }
            let db = new DB(name, 'xxxxxxx');
            db.drop().then(resolve).catch(reject);
        });
    }
}
