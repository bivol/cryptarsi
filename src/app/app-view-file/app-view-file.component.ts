import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TarTools } from '../cryptarsi/Tar';

@Component({
    //moduleId: module.id,
    selector: 'app-view-file',
    templateUrl: './app-view-file.component.html',
    styleUrls: ['./app-view-file.component.css']
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

    clearUrl = null;
    dataUrl = null;

    constructor(private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this.db = this.tab.db;
        this.type = this.tab.type;
        console.log('Retrieve data for', this.name, this.index);
        this.db.getData(this.index).then((s) => {
                //console.log('got data', s);
                //console.log('retrieved index ', this.index, this.type);
                //let ds = (t) => { let s = ''; for (let i = 0; i < t.length; i++) { s += t.charCodeAt(i) + ' '; }; return s; };
                //console.log('DS IS', ds(s));
                if (s.match(/XXXX(\{.*?\})XXXX/)) {
                    this.obj = JSON.parse(s.match(/XXXX(\{.*?\})XXXX/)[1]);
                    this.data = s.replace(/\s*XXXX(\{.*?\})XXXX/, '');
                    this.files = this.obj.gindex;
                } else {
                    this.data = s;
                }
                let Uint8 = TarTools.stringToUint8(s);
                //console.log('My Uint8 is', Uint8);
                this.clearUrl = window.URL.createObjectURL(new Blob([Uint8], { type: this.type }));
                this.dataUrl = this.sanitizer.bypassSecurityTrustUrl(this.clearUrl);
                console.log('dataUrl is', this.dataUrl, this.clearUrl);
            })
            .catch((e) => {
                // Error, for some reason we cannot retrieve the data
                //console.log('Error retrieve data', e);
            });
    }

    viewFile(item) {
        //console.log('View is clicked', item);
        item.db = this.db;
        this.onOpen.emit(item);
    }

    closeTab() {
        this.onClose.emit();
    }

    downloadFile() {
        window.open(this.dataUrl, '_new');
    }

    prevPage() {
        this.page = Math.max(--this.page, 1);
    }

    nextPage() {
        this.page = Math.min(++this.page, 999);
    }
}

