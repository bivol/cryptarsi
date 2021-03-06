// <reference path="Jen.d.ts"/>
import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { Dialog } from '../app-dialog/app-dialog.component';
import { MdDialog, MdSnackBar } from '@angular/material';
import { MdInput} from '@angular/material';
import { ImportDir } from '../cryptarsi/ImportDir';
import { Jen } from '../cryptarsi/Jen';
import { log } from '../cryptarsi/log';
import { AppDbService } from '../app-db-service/app-db-service';

@Component({
    // moduleId: module.id,
    selector: 'app-import-dir',
    templateUrl: './app-import-dir.component.html',
    styleUrls: ['./app-import-dir.component.css']
})
export class AppImportDirComponent {
    componentName: 'AppImportDirComponent';

    @Output() onImport = new EventEmitter();

    @ViewChild('dbName') dbName: MdInput;
    @ViewChild('encKey1') encKey1: MdInput;
    @ViewChild('encKey2') encKey2: MdInput;
    @ViewChild('dirName') dirName;
    @ViewChild('description') description: MdInput;
    @ViewChild('clearTextPassword') clearTextPassword;

    files: any = null;

    progress: number = 0;
    nofile: number = 0;
    nofiles: number = 0;
    filename: string = '';
    processing = false;

    constructor(private _dialog: MdDialog,
                private _snackbar: MdSnackBar,
                private db: AppDbService
               ) {
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

    validateKeys(): boolean {
        if (this.encKey1.value !== this.encKey2.value) {
            this.encKey1.dividerColor = 'warn';
            this.encKey1.hintLabel = 'Non equal keys!';
            this.encKey2.dividerColor = 'warn';
            this.encKey2.hintLabel = 'Non equal keys!';
            return false;
        }

        this.encKey1.hintLabel = '';
        this.encKey2.hintLabel = '';
        this.encKey1.dividerColor = 'primary';
        this.encKey2.dividerColor = 'primary';
        return true;
    }

    validateFiles(): boolean {
        if ((!this.files) || (this.files.length === 0)) {
            this._snackbar.open('Please select directory to encrypt', 'OK');
            return false;
        }
        return true;
    }

    checkDb() {
        return new Promise((resolve, reject) => {
            log('Checking db');
            this.db.isPresent(this.dbName.value).then(() => {
                log('DB exist');
                this.dbName.dividerColor = 'warn';
                this.dbName.hintLabel = 'Already exist!';
                return reject();
            }).catch(resolve);
        });
    }

    checkForm() {
        return new Promise((resolve, reject) => {
            if (!this.validateDbName()) {
                this.dbName.focus();
                return reject();
            }

            if (!this.validateKeys()) {
                this.encKey1.focus();
                return reject();
            }

            if (!this.validateFiles()) {
                return reject();
            }

            this.checkDb().then(resolve).catch(reject); // Check if the db exist
        });
    }

    onDirChange(e) {
        this.files = e.target.files || e.srcElement.files;
        log('files', this.files);
    }

    onStrongPassword() {
        let j = new Jen();
        let password = j.password(15, 20, /[a-z0-9]/);
        this.encKey1.value = password;
        this.encKey2.value = password;
        let dialog = new Dialog(this._dialog);
        log('New dialog', this._dialog);
        dialog.open('Your password is ' + password + ' Do you wanna keep it?', (v) => {
            log('Dialog Call back', v);
            if (v === 'yes') {
                this._snackbar.open('Remember! Your password is ' + password, 'Close');
            } else {
                this._snackbar.open('Select another password', 'OK');
            }
        });
    }

    submit() {
        this.checkForm().then(() => {
            this.processing = true;
            let r = new ImportDir(this.dbName.value, this.encKey1.value, this.description.value);
            r.importFiles(this.files,
                (f, loaded, total, count, totalcnt) => {
                log('Downloading', f.name, loaded, total, count, totalcnt);
                this.progress = parseFloat((100 * (loaded / total)).toFixed(1));
                this.nofile = count;
                this.nofiles = totalcnt;
                this.filename = f.name;
            }).then(() => {
                this.progress = 100;
                this.processing = false;
                this._snackbar.open('The data set is created and imported', 'OK');
                this.onImport.emit();
            });
        }).catch(() => {});
    }
}
