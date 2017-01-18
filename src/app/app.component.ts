//import {enableProdMode} from '@angular/core';
//enableProdMode();
import { Component } from '@angular/core';
import { log } from './log';
//import { FileWriterAPI } from './cryptarsi/FileWriter';
import { AppDbService } from './app-db-service/app-db-service';


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

  constructor(private db: AppDbService) {
    this.refreshDbList();
/*    let file = new FileWriterAPI('gosho.txt');
    setInterval(() => {
      console.log('Write to file');
      file.writeToFile(new Blob(['aaaa\n'], { type: 'text/plain'}))
        .then(() => console.log('successful write'))
        .catch((e) => console.log('Error, write', e));
      console.log('File url is', file.url());
    }, 5000);
    */
  }

  selectDatabase(name: string) {
    this.menuSelected = null;
    this.databaseSelected = name;
  }

  refreshDbList() {
    this.db.list().then((dbList: any) => {
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
