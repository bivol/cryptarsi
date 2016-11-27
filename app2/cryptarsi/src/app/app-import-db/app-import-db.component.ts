import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MdInput, MdSnackBar } from '@angular/material';

@Component({
    //moduleId: module.id,
    selector: 'app-import-db',
    templateUrl: 'app-import-db.component.html',
    styleUrls: ['app-import-db.component.css']
})
export class AppImportDbComponent {
    @Output() onImport = new EventEmitter();

    constructor(private _snackbar: MdSnackBar) {
    }

}
