import { Component, ViewChild } from '@angular/core';
import { MdInput } from '@angular/material';

@Component({
    //moduleId: module.id,
    selector: 'import-dir',
    templateUrl: 'import-dir.component.html',
    styleUrls: ['import-dir.component.css']
})
export class ImportDirComponent {
    @ViewChild('dbName') dbName: MdInput;
    encryptionMenuVisible = true;
    startEncryption() {
        this.encryptionMenuVisible = false;
        console.log('aaa');
    }

    checkForm(): boolean {
        console.log('value', this.dbName.value);
        if (!this.dbName.value) {
            this.dbName.focus();
        }
        return true;
    }

    submit() {
        this.checkForm();
    }
}
