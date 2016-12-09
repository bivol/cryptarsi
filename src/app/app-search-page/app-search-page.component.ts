import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { Dialog } from '../app-dialog/app-dialog.component';
import { MdDialog, MdSnackBar } from '@angular/material';
import { DB } from '../cryptarsi/Database';
import { Search } from '../cryptarsi/Search';
import { ExportDB } from '../cryptarsi/ExportDB';
import { log } from '../log';

@Component({
    //moduleId: module.id,
    selector: 'app-search-page',
    templateUrl: 'app-search-page.component.html',
    styleUrls: ['app-search-page.component.css'],
})

export class AppSearchPageComponent implements OnInit {
    @Input('database') database;
    @Output() onDrop = new EventEmitter();
    @ViewChild('encKey') encKey;
    @ViewChild('searchInput') searchInput;

    open = false;

    db: DB = null;
    srch: Search;

    exportWorking = false;
    searchWorking = false;

    selectedTab = 0;

    results = [];

    openTabs = [];

    constructor(private _dialog: MdDialog, private _snackbar: MdSnackBar) {
    }

    ngOnInit() {
        log('Input is', this.database);
    }

    openDb() {
        log('Opening database', this.database, this.encKey.value);
        this.db = new DB(this.database, this.encKey.value);
        this.db.open().then(() => {
            this.db.getData(0).then((v: string) => {
                log('Decrypted index 0 is', v);
                if (v.match(/^[0-9 ]+$/)) {
                    this.open = true;
                    this.srch = new Search(this.db);
                } else {
                    this._snackbar.open('Your encryption key is probably wrong', 'OK');
                }
            }).catch((e) => {
                log('Cannot open the db', e);
                this._snackbar.open('Cannot read the database', 'OK');
            });
        }).catch((e) => {
            log('Cannot open the db', e);
            this._snackbar.open('Cannot open the database', 'OK');
        });
    }

    closeDb() {
        this.open = false;
        if (this.db) {
            this.db.close().then(() => {
                this.db = null;
            });
        }
    }

    dropDb() {
        log('We call dropDb', this.database);
        let dialog = new Dialog(this._dialog);
        log('New dialog', this._dialog);
        dialog.open('Are you sure you want to drop the database?', (v) => {
            log('Dialog Call back', v);
            if (v === 'yes') {
                let myDb = this.db ? this.db : new DB(this.database, 'xxxxxxx');
                log('yes, db is', myDb);
                myDb.drop().then(() => {
                    log('Successfully dropped');
                    this.onDrop.emit();
                    this._snackbar.open('The database is removed!', 'OK');
                }).catch((e) => {
                    log('Cannot drop the database', this.database);
                    this._snackbar.open('The database cannot be removed!', 'OK');
                });
            }
        });
    }

    search() {
        log('Search pressed', this.searchInput.value);
        this.results = [];
        this.searchWorking = true;
        this.srch.searchRule(this.searchInput.value, (index, data) => {
            this.results.push({
                position: this.results.length,
                index: index,
                text: data,
                db: this.db,
                query: this.searchInput.value
            });
        }).then(() => {
            this.searchWorking = false;
        }).catch(() => {
            this.searchWorking = false;
        });
    }

     cryptarsifiles() {
        log('Files list pressed', this.searchInput.value);
        this.results = [];
        this.searchWorking = true;
        this.srch.searchRule('cryptarsi all files', (index, data) => {
            this.results.push({
                position: this.results.length,
                index: index,
                text: data,
                db: this.db,
                query: this.searchInput.value
            });
        }).then(() => {
            this.searchWorking = false;
        }).catch(() => {
            this.searchWorking = false;
        });
    }

    selectTab(e) {
        //console.log('eee', e, e && e.index);
        if (e && e.hasOwnProperty('index')) {
            //console.log('Selected tab changes to', e.index);
            this.selectedTab = e.index;
        }
    }

    openNewTab(item) {
        //console.log('New tab has to be open', item);
        // Add it only if it does not exist
        let pos = this.openTabs.map(n => n.name === item.name).indexOf(true) + 1;
        if (pos === 0) {
            this.openTabs.push(item);
            pos = this.openTabs.length;
        }
        console.log('Going to position', pos);
        setTimeout(() => {
            this.selectedTab = pos;
            console.log('Selected tab is', pos);
        }, 250);
    }

    closeTab(item) {
        console.log('This tab is closed', item);
        if (this.openTabs.filter(n => n.name === item.name).length > 0) {
            this.openTabs.splice(this.openTabs.map(n => n.name === item.name).indexOf(true), 1);
            this.selectedTab = 0;
        }
    }

    exportDb() {
        console.log('Export database');
        let exp = new ExportDB(this.db);
        this.exportWorking = true;
        exp.exportTar().then((buffer) => {
            console.log('The database is exported, make it downloadable');
            window.open(window.URL.createObjectURL(buffer));
            this.exportWorking = false;
        }).catch((e) => {
            console.log('Error exporting Tar', e);
            this._snackbar.open('Cannot export the database');
            this.exportWorking = false;
        });
    }
}
