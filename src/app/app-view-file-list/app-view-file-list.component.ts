import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

let IconMap = {
    'audio/mp3': 'fa fa-file-audio-o',
    'audio/ogg': 'fa fa-file-audio-o',
    'audio/wav': 'fa fa-file-audio-o',
    'image/jpeg': 'fa fa-file-picture-o',
    'image/png': 'fa fa-file-picture-o',
    'image/gif': 'fa fa-file-picture-o',
    'video/mp4': 'fa fa-file-video-o',
    'video/avi': 'fa fa-file-video-o',
    'video/mpeg': 'fa fa-file-video-o',
    'video/webm': 'fa fa-file-video-o',
    'application/pdf': 'fa fa-file-pdf-o',
    'text/plain': 'fa fa-file-text-o',
    'text/html': 'fa fa-file-code-o',
    'text/xml': 'fa fa-file-code-o'
};

@Component({
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
    sortedlist = {};
    types = [];

    constructor(public sanitizer: DomSanitizer) {
    }

    processFiles() {
        // Now, if we have sorted, we shall group them by type
        console.log('View file', this.files);
        this.filelist = this.files.slice(); // Make a copy
        if (this.sorted) {
            console.log('sorting');
            this.filelist = this.files.slice().sort((a, b) => {
                let [n, m] = [a.type + a.name, b.type + b.name];
                return (n < m) ? -1 : (n > m);
            }); // Sort by type
            let x = {};
            this.filelist.forEach((n) => (x[n.type] && x[n.type].push(n)) || (x[n.type] = [n]));
            this.sortedlist = x;
            this.types = Object.keys(x);
        } else {
            this.filelist = this.files;
        }
        if (this.limit) {
            console.log('limit is', this.limit);
            this.filelist = this.filelist.slice(0, this.limit);
        }
        this.filelist.forEach((n) => {
            console.log('imap', n.type, IconMap[n.type], IconMap);
            n.icona = IconMap[n.type] || 'format_align_left';
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
