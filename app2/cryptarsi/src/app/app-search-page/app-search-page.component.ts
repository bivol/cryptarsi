import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Dialog } from '../app-dialog/app-dialog.component';
import { MdDialog, MdSnackBar } from '@angular/material';
import { DB } from '../cryptarsi/Database';

@Component({
    //moduleId: module.id,
    selector: 'app-search-page',
    templateUrl: 'app-search-page.component.html',
    styleUrls: ['app-search-page.component.css'],
})

export class AppSearchPageComponent {
    @Input('database') database;
    @Output() onDrop = new EventEmitter();
    @ViewChild('encKey') encKey;

    open = false;

    db: DB;

    constructor(private _dialog: MdDialog, private _snackbar: MdSnackBar) {
        console.log('Input is', this.database);
    }

    openDb() {
        console.log('Opening database', this.database, this.encKey.value);
        this.db = new DB(this.database, this.encKey.value);
        this.db.open().then(() => {
            this.db.getData(0).then((v: string) => {
                console.log('Decrypted index 0 is', v);
                if (v.match(/^[0-9 ]+$/)) {
                    this.open = true;
                } else {
                    this._snackbar.open('Your encryption key is probably wrong', 'OK');
                }
            }).catch((e) => {
                console.log('Cannot open the db', e);
                this._snackbar.open('Cannot read the database', 'OK');
            });
        }).catch((e) => {
            console.log('Cannot open the db', e);
            this._snackbar.open('Cannot open the database', 'OK');
        });
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
                    this.onDrop.emit();
                    this._snackbar.open('The database is removed!', 'OK');
                }).catch((e) => {
                    console.log('Cannot drop the database', this.database);
                    this._snackbar.open('The database cannot be removed!', 'OK');
                });
            }
        });
    }

    search() {
    }

}
