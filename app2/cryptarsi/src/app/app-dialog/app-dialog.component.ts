import { Component, Optional } from '@angular/core';
import {MdDialog, MdDialogRef} from '@angular/material';

let text = 'test';

@Component({
    //moduleId: module.id,
    selector: 'app-dialog',
    templateUrl: 'app-dialog.component.html',
    styleUrls: ['app-dialog.component.css']
})
export class AppDialogComponent {
    question: string = text;
    constructor(@Optional() public dialogRef: MdDialogRef<AppDialogComponent>) {
    }
}


export class Dialog {

    constructor(private _dialog: MdDialog) {
    }

    open(question, cb = (value) => {}) {
        text = question;
        let dialogRef = this._dialog.open(AppDialogComponent);
        dialogRef.afterClosed().subscribe(cb);
    }
}
