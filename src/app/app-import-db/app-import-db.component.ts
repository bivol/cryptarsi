import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MdInput, MdSnackBar } from '@angular/material';
import { log } from '../log';
import { DbList } from '../cryptarsi/Database';
import { ImportDB } from '../cryptarsi/ImportDB';

@Component({
    //moduleId: module.id,
    selector: 'app-import-db',
    templateUrl: './app-import-db.component.html',
    styleUrls: ['./app-import-db.component.css']
})
export class AppImportDbComponent {
    @Output() onImport = new EventEmitter();
    @ViewChild('dbName') dbName: MdInput;
    @ViewChild('fileName') fileName;

    progress: number = 0;
    processing = false;
    files: any = null;

    constructor(private _snackbar: MdSnackBar) {
    }

    validateDbName(): boolean {
        if (!this.dbName.value) {
            this.dbName.dividerColor = 'warn';
            this.dbName.hintLabel = 'Enter valid name!';
            return false;
        }
        this.dbName.dividerColor = 'primary';
        this.dbName.hintLabel = '';
        return true;
    }

    validateFiles(): boolean {
        if ((!this.files) || (this.files.length === 0)) {
            this._snackbar.open('Please select file to import', 'OK');
            return false;
        }
        return true;
    }

    checkDb() {
        return new Promise((resolve, reject) => {
            log('Checking db', this.dbName.value);
            DbList.isPresent(this.dbName.value).then(() => {
                log('DB exist');
                this.dbName.dividerColor = 'warn';
                this.dbName.hintLabel = 'Already exist!';
            }).catch(resolve);
        });
    }

    checkForm() {
        return new Promise((resolve, reject) => {
            if (!this.validateDbName()) {
                this.dbName.focus();
                reject();
            }

            if (!this.validateFiles()) {
                return reject();
            }

            this.checkDb().then(resolve).catch(reject); // Check if the db exist
        });
    }

    onFileChange(e) {
        this.files = e.target.files || e.srcElement.files;
        log('files', this.files);
    }

    submit() {
        this.checkForm().then(() => {
            this.processing = true;
            let imp = new ImportDB(this.dbName.value);
            imp.importFile(this.files, (f, loaded, total) => {
                this.progress = parseFloat((100 * (loaded / total)).toFixed(1));
            }).then(() => {
                this.progress = 0;
                this.processing = false;
                this._snackbar.open('Database is imported', 'OK');
                this.onImport.emit();
            }).catch((e) => {
                //console.log('Error importing', e);
                this.progress = 0;
                this.processing = false;
                this._snackbar.open('Cannot import the Database', 'OK');
            });
        }).catch(() => {});
    }
}
