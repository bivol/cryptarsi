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
    @Input() tab;
    //@Input() db; // Don't need it, the data is in this.obj.db
    @Output() onOpen = new EventEmitter();
    @Output() onClose = new EventEmitter();

    type;

    obj;
    files = [];
    db;
    data;

    page = 1;
    pdfSrc = "pdf.pdf";

    dataUrl;

    constructor() {
    }

    ngOnInit() {
        this.db = this.tab.db;
        this.type = this.tab.type;
        console.log('Retrieve data for', this.name, this.index);
        this.db.getData(this.index).then((s) => {
                console.log('got data', s);
                if (s.match(/XXXX(\{.*?\})XXXX/)) {
                    this.obj = JSON.parse(s.match(/XXXX(\{.*?\})XXXX/)[1]);
                    this.data = s.replace(/\s*XXXX(\{.*?\})XXXX/, '');
                    this.files = this.obj.gindex;
                } else {
                    this.data = s;
                }
                this.dataUrl = window.URL.createObjectURL(new Blob([s], { type: this.type }));
            })
            .catch((e) => {
                // Error, for some reason we cannot retrieve the data
                console.log('Error retrieve data', e);
            });
    }

    viewFile(item) {
        console.log('View is clicked', item);
        item.db = this.db;
        this.onOpen.emit(item);
    }

    closeTab() {
        this.onClose.emit();
    }
}

