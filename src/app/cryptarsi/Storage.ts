/**
 * Slightly modified version of angular2-indexeddb (patch will be applied over github)
 * URL: https://github.com/gilf/angular2-indexeddb
 * Author: Gil Fink
 */

import {Injectable} from '@angular/core';
import { log } from '../log';

@Injectable()
export class AngularIndexedDB {
    utils: Utils;
    dbWrapper: DbWrapper;

    constructor(dbName, version) {
        this.utils = new Utils();
        this.dbWrapper = new DbWrapper(dbName, version);
    }

    drop() {
        log('Store: drop database', this.dbWrapper.dbName);
        return new Promise((resolve, reject) => {
            log('Dropping');
            let request = this.utils.indexedDB.deleteDatabase(this.dbWrapper.dbName);
            request.onerror = (e) => {
                e.preventDefault(); // Firefox patch
                log('Dropping error', e);
                reject(e);
            };
            request.onblocked = (e) => {
                e.preventDefault(); // Firefox patch
                log('Dropping (b) error', e);
                reject(e);
            };
            request.onsuccess = () => {
                log('Database dropped', this.dbWrapper.dbName);
                resolve();
            };
            log('request', request);
        });
    }

    close() {
        log('Lets close the database', this.dbWrapper.dbName);
        return new Promise((resolve, reject) => {
            log('Closing');
            if (this.dbWrapper.db) {
                this.dbWrapper.db.close();
                setTimeout(() => { resolve(); }, 300); // Response when the db is supposed to be closed
            } else {
                resolve();
            }
        });
    }

    createStore(version, upgradeCallback) {
        let self = this,
            promise = new Promise<any>((resolve, reject) => {
                this.dbWrapper.dbVersion = version;
                let request = this.utils.indexedDB.open(this.dbWrapper.dbName, version);
                request.onsuccess = function (e) {
                    self.dbWrapper.db = request.result;
                    setTimeout(() => {
                        resolve(e);
                    }, 500);
                };

                request.onerror = function (e) {
                    e.preventDefault(); // Firefox patch
                    reject('IndexedDB error: ' + e.target.errorCode);
                };

                request.onabort = function(e) {
                    e.preventDefault(); // Firefox patch
                    reject('IndexedDB error: ' + e.target.errorCode);
                };

                request.onclose = function(e) {
                    reject('IndexedDB error: ' + e.target.errorCode);
                };

                request.onupgradeneeded = function (e) {
                    upgradeCallback(e, self.dbWrapper.db);
                };
            });

        return promise;
    }

    getByKey(storeName: string, key: any) {
        let self = this;
        let result;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(result);
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                result,
                request;

            request = objectStore.get(key);
            request.onsuccess = function (event) {
                result = event.target.result;
            }
        });

        return promise;
    }

    getAll(storeName: string) {
        let self = this;
        let promise = new Promise<any>((resolve, reject ) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let result = [],
                transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(result);
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                request = objectStore.openCursor();

            request.onerror = function (e) {
                e.preventDefault(); // Firefox patch
                reject(e);
            };

            request.onsuccess = function (evt) {
                let cursor = (<IDBOpenDBRequest>evt.target).result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor['continue']();
                }
            };
        });

        return promise;
    }

    getAllCb(storeName: string, cb) {
        let self = this;
        let promise = new Promise<any>((resolve, reject ) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve();
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                request = objectStore.openCursor();

            request.onerror = function (e) {
                e.preventDefault(); // Firefox patch
                reject(e);
            };

            request.onsuccess = function (evt) {
                let cursor = (<IDBOpenDBRequest>evt.target).result;
                if (cursor) {
                    cb(cursor.value).then(() => {
                        //console.log('Got back from the cb')
                        cursor['continue']();
                    }).catch((e) => {
                        reject(e);
                    });
                }
            };
        });

        return promise;
    }

    add(storeName: string, value: any, key?: any) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readWrite,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve({ key: key, value: value });
                    }
                }),
                objectStore = transaction.objectStore(storeName);

            if (key) {
                objectStore.add(value, key);
            } else {
              //  console.log('Adding value', value);
                try {
                    objectStore.add(value);
                } catch (e) {
                    //console.log('Error adding', e);
                    reject(e);
                }

            }
        });

        return promise;
    }

    update(storeName: string, value: any, key?: any) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readWrite,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(value);
                    },
                    abort: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName);

            if (key) {
                objectStore.put(value, key);
            } else {
                objectStore.put(value);
            }
        });

        return promise;
    }

    delete(storeName: string, key: any) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readWrite,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve();
                    },
                    abort: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName);

            objectStore['delete'](key);
        });

        return promise;
    }

    openCursor(storeName, cursorCallback: (evt) => void) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve();
                    },
                    abort: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                request = objectStore.openCursor();

            request.onsuccess = (evt) => {
                cursorCallback(evt);
                resolve();
            };
        });

        return promise;
    }

    clear(storeName: string) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readWrite,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve();
                    },
                    abort: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName);
            objectStore.clear();
            resolve();
        });

        return promise;
    }

    getByIndex(storeName: string, indexName: string, key: any) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({ storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(e);
                        // resolve(result);
                    },
                    abort: (e: Event) => {
                        e.preventDefault(); // Firefox patch
                        reject(e);
                    }
                }),
                result,
                objectStore = transaction.objectStore(storeName),
                index = objectStore.index(indexName),
                request = index.get(key);

            request.onsuccess = (event) => {
                result = (<IDBOpenDBRequest>event.target).result;
            };
        });

        return promise;
    }
}

class Utils {
    dbMode: DbMode;
    indexedDB;

    constructor() {
        this.indexedDB = window.indexedDB ||
            (<any>window).mozIndexedDB ||
            (<any>window).webkitIndexedDB ||
            (<any>window).msIndexedDB;
        this.dbMode = {
            readOnly: 'readonly',
            readWrite: 'readwrite'
        };
    }
}

interface DbMode {
    readOnly: string;
    readWrite: string;
}

class DbWrapper {
    dbName: string;
    dbVersion: number;
    db: IDBDatabase;

    constructor(dbName, version) {
        this.dbName = dbName;
        this.dbVersion = version || 1;
        this.db = null;
    }

    validateStoreName(storeName) {
        return this.db.objectStoreNames.contains(storeName);
    };

    validateBeforeTransaction(storeName: string, reject) {
        if (!this.db) {
            reject('You need to use the createStore function to create a database before you query it!');
        }
        if (!this.validateStoreName(storeName)) {
            reject(('objectStore does not exists: ' + storeName));
        }
    }

    createTransaction(
        options: {
            storeName: string,
            dbMode: string,
            error: (e: Event) => any,
            complete: (e: Event) => any,
            abort?: (e: Event) => any }): IDBTransaction {
        let trans: IDBTransaction = this.db.transaction(options.storeName, options.dbMode);
        trans.onerror = options.error;
        trans.oncomplete = options.complete;
        trans.onabort = options.abort;
        return trans;
    }
}
