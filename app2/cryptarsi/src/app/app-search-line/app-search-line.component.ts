import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

interface FileObj {
    name?;
    gindex?;
    index?;
    type?;
    size?;
    group?;
}

@Component({
    //moduleId: module.id,
    selector: 'app-search-line',
    templateUrl: 'app-search-line.component.html',
    styleUrls: ['app-search-line.component.css']
})

export class AppSearchLineComponent implements OnInit {
    @Input('position') position;
    @Input('index') index;
    @Input('text') text;
    @Input('query') query;
    @Input('db') db;

    @Output() onOpen = new EventEmitter();

    obj: FileObj = <FileObj>{};
    content = '';
    filename = '';
    files = [];

    constructor() {
    }

    ngOnInit() { // Called when Input is populated
        if (this.text.match(/XXXX\{.*?\}XXXX/)) {
            this.obj = <FileObj>JSON.parse(this.text.match(/XXXX(\{.*?\})XXXX/)[1]);
            this.content = this.text.replace(/\s*XXXX(\{.*?\})XXXX/, '');
            this.filename = this.obj.name;
            this.files = this.obj.gindex;
            console.log('search-line', this.obj);
        }
    }

    viewFile(item) {
        console.log('View is clicked', item, this.db);
        item.db = this.db;
        this.onOpen.emit(item);
    }
}
