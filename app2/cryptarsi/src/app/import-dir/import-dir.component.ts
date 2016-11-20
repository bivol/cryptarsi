import { Component, ViewChild, Optional } from '@angular/core';
import { MdInput, MdSnackBar } from '@angular/material';
import { ImportDir } from '../cryptarsi/ImportDir';
import { Crypto } from '../cryptarsi/CryptoAPI';

@Component({
    // moduleId: module.id,
    selector: 'import-dir',
    templateUrl: 'import-dir.component.html',
    styleUrls: ['import-dir.component.css']
})
export class ImportDirComponent {
    componentName: 'ImportDirComponent';

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
        var c = new Crypto('parola');
        let cr = c.encrypt('moiat test');
        console.log('ENC',cr);
        let rc = c.decrypt(cr);
        console.log('DEC',rc);
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

    checkForm(): boolean {
        if (!this.validateDbName()) {
            this.dbName.focus();
            return false;
        }

        if (!this.validateKeys()) {
            this.encKey1.focus();
            return false;
        }

        return true;
    }

    onDirChange(e) {
        this.files = e.srcElement.files;
        console.log('files', this.files);
    }

    submit() {
        if (this.checkForm()) {
            this.processing = true;
            let r = new ImportDir(this.dbName.value, this.encKey1.value);
            r.importFiles(this.files,
                (f, loaded, total, count, totalcnt) => {
                console.log('Downloading', f.name, loaded, total, count, totalcnt);
                this.progress = parseFloat((100 * (loaded / total)).toFixed(1));
                this.nofile = count;
                this.nofiles = totalcnt;
                this.filename = f.name;
            }).then(() => {
                this.progress = 100;
                this.processing = false;
                this._snackbar.open('The database is created and imported','OK');
            });
        }
    }
}
