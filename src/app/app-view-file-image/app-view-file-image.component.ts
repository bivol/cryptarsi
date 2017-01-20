import { Component, Input } from '@angular/core';

@Component({
    //moduleId: module.id,
    selector: 'app-view-file-image',
    templateUrl: './app-view-file-image.component.html',
    styleUrls: ['./app-view-file-image.component.css']
})
export class AppViewFileImageComponent {
    @Input() data;
    @Input() type;
    @Input() name;
}
