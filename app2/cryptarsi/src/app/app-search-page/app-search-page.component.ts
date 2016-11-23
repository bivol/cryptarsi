import { Component, Input, ViewChild } from '@angular/core';
import { Dialog } from '../app-dialog/app-dialog.component';
import { MdDialog } from '@angular/material';
import { DB } from '../cryptarsi/Database';

@Component({
    //moduleId: module.id,
    selector: 'app-search-page',
    templateUrl: 'app-search-page.component.html',
    styleUrls: ['app-search-page.component.css'],
})

export class AppSearchPageComponent {
    @Input('database') database;
    @ViewChild('encKey') encKey;

    open = false;

    db: DB;

    constructor(private _dialog: MdDialog) {
        console.log('Input is', this.database);
    }

    openDb() {
        this.open = true; // TODO: Implement check that the database is decodeable
        console.log('Opening database', this.database, this.encKey.value);
        this.db = new DB(this.database, this.encKey.value);
    }

    closeDb() {
        this.open = false;
        this.db = null;
    }

    dropDb() {
        console.log('We call dropDb', this.database);
        let dialog = new Dialog(this._dialog);
        dialog.open('Are you sure you want to drop the database?', (v) => {
            if (v === 'yes') {
                this.db.drop().then(() => {
                    console.log('Successfully dropped');
                }).catch((e) => {
                    console.log('Cannot drop the database', this.database);
                });
            }
        });
    }

    search() {
    }

}
