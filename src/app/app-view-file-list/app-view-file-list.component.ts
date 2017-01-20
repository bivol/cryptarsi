import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    //moduleId: module.id,
    selector: 'app-view-file-list',
    templateUrl: './app-view-file-list.component.html',
    styleUrls: ['./app-view-file-list.component.css']
})
export class AppViewFileListComponent implements OnInit, OnChanges {
    @Input() files;
    @Input() limit;
    @Input() sorted;
    @Input() header;
    @Output() onOpen = new EventEmitter();

    filelist = [];

    constructor(public sanitizer: DomSanitizer) {
    }

    processFiles() {
        // Now, if we have sorted, we shall group them by type
        console.log('View file', this.files);
        this.filelist = this.files.slice(); // Make a copy
        if (this.sorted) {
            console.log('sorting');
            this.filelist = this.files
                .slice()
                .sort((a, b) => {
                    let n = a.type + a.name;
                    let m = b.type + b.name;
                    if (n === m) { return 0; }
                    if (n > m) { return 1; }
                    return -1;
                }); // Sort by type
        } else {
            this.filelist = this.files;
        }
        if (this.limit) {
            console.log('limit is', this.limit);
            this.filelist = this.filelist.slice(0, this.limit);
        }
        this.filelist.forEach((n) => {
            let icona = 'format_align_left';
            switch (n.type) {
                case 'audio/mp3':
                case 'audio/ogg':
                case 'audio/wav':
                    icona = 'volume_down';
                    break;
                case 'image/jpeg':
                case 'image/png':
                case 'image/gif':
                    icona = 'image';
                    break;
                case 'video/mp4':
                case 'video/avi':
                case 'video/mpeg':
                case 'video/webm':
                    icona = 'videocam';
                    break;
                case 'application/pdf':
                    icona = 'format_align_left';
                    break;
            }
            n.icona = icona;
        });
        console.log('filelist', this.filelist);
    }

    ngOnInit() {
        this.processFiles();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['files']) {
            this.processFiles();
        }
    }

    viewFile(item) {
        this.onOpen.emit(item);
    }
}
