import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { allFileName, lonelyFileName } from '../cryptarsi/FileReader';

interface FileObj {
    name?;
    gindex?;
    index?;
    type?;
    icon?;
    size?;
    group?;
}

@Component({
    //moduleId: module.id,
    selector: 'app-search-line',
    templateUrl: './app-search-line.component.html',
    styleUrls: ['./app-search-line.component.css']
})

export class AppSearchLineComponent implements OnInit {
    @Input('position') position;
    @Input('index') index;
    @Input('text') text;
    @Input('query') query;
    @Input('db') db;

    @Output() onOpen = new EventEmitter();

    obj = {};
    content = '';
    filename = '';
    files = [];
    fileslist = [];

    maxLength = 500;

    constructor() {
    }

    ngOnInit() { // Called when Input is populated
        if (this.text.match(/XXXX\{.*?\}XXXX/)) {
            this.obj = <FileObj>JSON.parse(this.text.match(/XXXX(\{.*?\})XXXX/)[1]);
            this.content = this.text.replace(/\s*XXXX(\{.*?\})XXXX/, '');
            if (this.content.length > this.maxLength) {
                this.content = this.content.substr(0, this.maxLength) + '...';
            }
            this.filename = (<FileObj>this.obj).name;
            if(this.filename == allFileName.name) {
            this.fileslist = (<FileObj>this.obj).gindex;
            }
            this.files = (<FileObj>this.obj).gindex;
            //this.files = (<FileObj>this.obj).gindex instanceof Array ? (<FileObj>this.obj).gindex.slice(0, 5) : [];
            //console.log('search-line', this.obj);
        }
    }

    viewFile(item?) {
        if (item) {
            //console.log('View is clicked', item, this.db);
            item.db = this.db;
            this.onOpen.emit(item);
        } else {
            let item2 = this.files.filter((n) => n.name == this.filename).shift();
            if ((!item2) && (this.filename == allFileName.name)) {
                item2 = allFileName;
            }
            if ((!item2) && (this.filename == lonelyFileName.name)) {
                item2 = lonelyFileName;
            }
            if (item2) {
                item2.db = this.db;
                this.onOpen.emit(item2);
            }
        }
    }
}
