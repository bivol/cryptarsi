import { Component, Input } from '@angular/core';

@Component({
    //moduleId: module.id,
    selector: 'app-view-file-audio',
    templateUrl: './app-view-file-audio.component.html',
    styleUrls: ['./app-view-file-audio.component.css']
})
export class AppViewFileAudioComponent {
    @Input() data;
    @Input() type;
    @Input() name;
}
