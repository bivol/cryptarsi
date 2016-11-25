import { Component } from '@angular/core';
import { DB, DbList } from './cryptarsi/Database';
import { log } from './log';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cryptarsi';
  collection: any = undefined;
  databaseSelected: string = null;
  menuSelected = null;

  constructor() {
    this.refreshDbList();
  }

  selectDatabase(name: string) {
    this.menuSelected = null;
    this.databaseSelected = name;
  }

  refreshDbList() {
    DbList.list().then((dbList: any) => {
      log('Database list is', dbList);
      this.collection = dbList;
    });
  }

  clearSelection() {
    this.databaseSelected = null;
    this.refreshDbList();
  }

  importedDir() {
    this.refreshDbList();
  }
}
