import { Component, Input } from '@angular/core';

@Component({
    //moduleId: module.id,
    selector: 'app-view-file-video',
    templateUrl: './app-view-file-video.component.html',
    styleUrls: ['./app-view-file-video.component.css']
})
export class AppViewFileVideoComponent {
    @Input() data;
    @Input() type;
    @Input() name;
}
