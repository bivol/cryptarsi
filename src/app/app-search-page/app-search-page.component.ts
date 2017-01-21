import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { Dialog } from '../app-dialog/app-dialog.component';
import { MdDialog, MdSnackBar } from '@angular/material';
//import { DB } from '../cryptarsi/Database';
import { Search } from '../cryptarsi/Search';
import { ExportDB } from '../cryptarsi/ExportDB';
import { log } from '../cryptarsi/log';
import { AppDbService } from '../app-db-service/app-db-service';

@Component({
    //moduleId: module.id,
    selector: 'app-search-page',
    templateUrl: './app-search-page.component.html',
    styleUrls: ['./app-search-page.component.css'],
})

export class AppSearchPageComponent implements OnInit {
    @Input('database') database;
    @Output() onDrop = new EventEmitter();
    @ViewChild('encKey') encKey;
    @ViewChild('searchInput') searchInput;

    open = false;
    db = null;
    srch: Search;

    exportWorking = false;
    searchWorking = false;

    selectedTab = 0;

    results = [];

    openTabs = [];


    constructor(private _dialog: MdDialog,
                private _snackbar: MdSnackBar,
                private DB: AppDbService
               ) {
    }

    ngOnInit() {
        log('Input is', this.database);
    }

    openDb() {
        log('Opening database', this.database, this.encKey.value);
        this.DB.open(this.database, this.encKey.value).then((db) => {
            this.db = db;
            db.getData(0).then((v: string) => {
                log('Decrypted index 0 is', v);
                if (v.match(/^[0-9 ]+$/)) {
                    this.open = true;
                    this.srch = new Search(this.db);
                    // Dirty hack to display the files list first
                  /*  this.results = [];
                    this.searchWorking = false;
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
                    }); */
                    // Dirty hack ends
                } else {
                    this._snackbar.open('Your encryption key is probably wrong', 'OK');
                }
            }).catch((e) => {
                log('(1) Cannot open the db', e);
                this._snackbar.open('Cannot read the database', 'OK');
            });
        }).catch((e) => {
            log('(2) Cannot open the db', e);
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
                this.DB.drop(this.database).then(() => {
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
<<<<<<< Updated upstream
        }).then(() => this.searchWorking = false )
        .catch(() => this.searchWorking = false );
=======
        }).then(() => {
            this.searchWorking = false;
        }).catch(() => {
            this.searchWorking = false;
        });
        this.selectedTab = 0;
>>>>>>> Stashed changes
    }

     cryptarsifiles() {
        log('Files list pressed', this.searchInput.value);
        this.results = [];
        this.searchWorking = false;
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
        this.selectedTab = 0;
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
        //console.log('Going to position', pos);
        setTimeout(() => {
            this.selectedTab = pos;
            //console.log('Selected tab is', pos);
        }, 250);
    }

    closeTab(item) {
        //console.log('This tab is closed', item);
        if (this.openTabs.filter(n => n.name === item.name).length > 0) {
            this.openTabs.splice(this.openTabs.map(n => n.name === item.name).indexOf(true), 1);
            this.selectedTab = 0;
        }
    }

    exportDb() {
        //console.log('Export database');
        let exp = new ExportDB(this.db);
        this.exportWorking = true;
        exp.exportTar().then((buffer) => {
            //console.log('The database is exported, make it downloadable');
            window.open(window.URL.createObjectURL(buffer));
            this.exportWorking = false;
        }).catch((e) => {
            //console.log('Error exporting Tar', e);
            this._snackbar.open('Cannot export the database');
            this.exportWorking = false;
        });
    }
}
