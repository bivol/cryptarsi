import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    //moduleId: module.id,
    selector: 'app-view-file-list',
    templateUrl: './app-view-file-list.component.html',
    styleUrls: ['./app-view-file-list.component.css']
})
export class AppViewFileListComponent implements OnInit {
    @Input() files;
    @Input() limit;
    @Input() sorted;
    @Input() header;
    @Output() onOpen = new EventEmitter();

    filelist = [];

    constructor(public sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        // Now, if we have sorted, we shall group them by type
        this.filelist = this.files.slice(); // Make a copy
        if (this.sorted) {
            this.filelist = this.files.slice().sort((a, b) => a.type > b.type); // Sort by type
        } else {
            this.filelist = this.files;
        }
        if (this.limit) {
            this.filelist = this.filelist.slice(0, this.limit);
        }
    }

    viewFile(item) {
        this.onOpen.emit(item);
    }
}
