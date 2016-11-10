import { Component, ViewChild } from '@angular/core';
import { MdInput } from '@angular/material';

@Component({
    // moduleId: module.id,
    selector: 'import-dir',
    templateUrl: 'import-dir.component.html',
    styleUrls: ['import-dir.component.css']
})
export class ImportDirComponent {
    @ViewChild('dbName') dbName: MdInput;
    @ViewChild('encKey1') encKey1: MdInput;
    @ViewChild('encKey2') encKey2: MdInput;
    @ViewChild('dirName') dirName;

    encryptionMenuVisible: boolean = true;

    constructor() {
    }

    startEncryption() {
        this.encryptionMenuVisible = false;
        console.log('aaa');
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

    submit() {
        this.checkForm();
        console.log('dir', this.dirName);
    }
}
