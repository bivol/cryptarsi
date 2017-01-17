import { Injectable } from '@angular/core';
import { DB, DbList } from '../cryptarsi/Database';

console.log('AppDbService instanciated');

@Injectable()
export class AppDbService {
    constructor() {
    }

    list() {
        return DbList.list();
    }

    isPresent(name) {
        return DbList.isPresent(name);
    }

}
