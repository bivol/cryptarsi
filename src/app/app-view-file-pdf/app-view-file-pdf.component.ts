import { Component, Input } from '@angular/core';

@Component({
    //moduleId: module.id,
    selector: 'app-view-file-pdf',
    templateUrl: './app-view-file-pdf.component.html',
    styleUrls: ['./app-view-file-pdf.component.css']
})
export class AppViewFilePdfComponent {
    @Input() data;
    @Input() type;
    @Input() name;
    page = 1;
    zoom = 0.5;

    constructor() {
    }

    prevPage() {
        this.page = Math.max(--this.page, 1);
    }

    nextPage() {
        this.page = Math.min(++this.page, 999);
    }

    zoomIn() {
        this.zoom = Math.max((this.zoom + 0.1), 1);
    }

    zoomOut() {
        this.zoom = Math.max((this.zoom - 0.1), 0.1);
    }

}
