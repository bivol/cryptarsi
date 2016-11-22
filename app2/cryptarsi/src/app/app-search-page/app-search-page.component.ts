import { Component, Input } from '@angular/core';

@Component({
    //moduleId: module.id,
    selector: 'app-search-page',
    templateUrl: 'app-search-page.component.html',
    styleUrls: ['app-search-page.component.css'],
})

export class AppSearchPageComponent {
    @Input('database') database;

    open = false;

    constructor() {
        console.log('Input is', this.database);
    }

    openDb() {
        this.open = true;
    }

    closeDb() {
        this.open = false;
    }
}
