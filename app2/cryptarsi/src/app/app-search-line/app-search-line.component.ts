import { Component, Input } from '@angular/core';

@Component({
    //moduleId: module.id,
    selector: 'app-search-line',
    templateUrl: 'app-search-line.component.html',
    styleUrls: ['app-search-line.component.css']
})
export class AppSearchLineComponent {
    @Input('position') position;
    @Input('index') index;
    @Input('text') text;
}
