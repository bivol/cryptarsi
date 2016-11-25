import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
    //moduleId: module.id,
    selector: 'app-view-file',
    templateUrl: 'app-view-file.component.html',
    styleUrls: ['app-view-file.component.css']
})
export class AppViewFileComponent implements OnInit {
    @Input() index;
    @Input() name;
    @Input() obj;
    @Output() onOpen = new EventEmitter();
    @Output() onClose = new EventEmitter();

    constructor() {
    }

    ngOnInit() {
    }
}

