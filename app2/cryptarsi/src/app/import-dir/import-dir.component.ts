import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MdInput, MdSnackBar } from '@angular/material';
import { ImportDir } from '../cryptarsi/ImportDir';
import { Crypto } from '../cryptarsi/CryptoAPI';
import { DbList } from '../cryptarsi/Database';
import { log } from '../log';

@Component({
    // moduleId: module.id,
    selector: 'app-import-dir',
    templateUrl: 'import-dir.component.html',
    styleUrls: ['import-dir.component.css']
})
export class ImportDirComponent {
    componentName: 'ImportDirComponent';

    @Output() onImport = new EventEmitter();

    @ViewChild('dbName') dbName: MdInput;
    @ViewChild('encKey1') encKey1: MdInput;
    @ViewChild('encKey2') encKey2: MdInput;
    @ViewChild('dirName') dirName;

    files: any = null;

    progress: number = 0;
    nofile: number = 0;
    nofiles: number = 0;
    filename: string = '';
    processing = false;

    constructor(private _snackbar: MdSnackBar) {
        let c = new Crypto('parola');
        let cr = c.encrypt('moiat test');
        log('ENC', cr);
        let rc = c.decrypt(cr);
        log('DEC', rc);
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

    checkDb() {
        return new Promise((resolve, reject) => {
            log('Checking db');
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

            if (!this.validateKeys()) {
                this.encKey1.focus();
                return reject();
            }

            this.checkDb().then(resolve).catch(reject); // Check if the db exist
        });
    }

    onDirChange(e) {
        this.files = e.srcElement.files;
        log('files', this.files);
    }

    submit() {
        this.checkForm().then(() => {
            this.processing = true;
            let r = new ImportDir(this.dbName.value, this.encKey1.value);
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
                this._snackbar.open('The database is created and imported', 'OK');
                this.onImport.emit();
            });
        }).catch(() => {});
    }
}
