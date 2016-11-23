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

  db: DB;

  constructor() {

    this.db = new DB('aa', 'enc');
    this.refreshDbList();

    log('Try to open the db');
    this.db.open().then(() => {
      log('Both indexes are completed');
      this.db.getNextIndex()
        .then((n) => log('next index is', n))
        .catch((e) => log('err', e));
      /*
      this.db.addIndexToHash('pesho', Math.random() * 100)
        .then(() => {
          log('Successful index modification');
          this.db.getHash('pesho').then((v) => log('pesho is', v)).catch((e) => log('Error gethash',e));
        })
        .catch((e) => log('index error', e));
        */
      /*
      this.db.modifyData(1, 'tralala')
        .then(() => {
          this.db.getData(1)
            .then((d) => log('data is', d))
            .catch((e) => log('gdata err', e));
        })
        .catch((e) => log('error', e));
        */
    }).catch(() => {
      log('Error');
    });
    /*
    this.db.createListDb().then(() => {
      log('ListDB created');
      this.db.addDatabase('pesho').then(() => {
        log('Pesho is added');
        this.db.getDatabase('pesho').then((x) => {
          log('Pesho is ',x);
          this.db.clearListDb().then(() => {
            log('The db list is clear');
          }).catch((e) => {
            log('Clear error',e);
          })
        }).catch((e) => {
          log('Pesho cannot be got');
        })
      }).catch((e) => {
        log('Pesho cannot be added',e);
        this.db.dropDatabase('pesho').then(() => {
          log('Pesho is dropped');
        }).catch((e) => {
          log('Pesho cannot be dropped',e);
        })
      })
    }).catch((e) => {
      log('ListDb cannot be created',e);
    })
    */

  }

  selectDatabase(name: string) {
    this.menuSelected = null;
    this.databaseSelected = name;
  }

  refreshDbList() {
    setTimeout(() => { // TODO: to be converted into events instead of polling
      DbList.list().then((dbList: any) => {
        log('Database list is', dbList);
        this.collection = dbList;
      });
    }, 500);
  }

  clearSelection() {
    this.databaseSelected = null;
    this.refreshDbList();
  }

  importedDir() {
    this.refreshDbList();
  }
}
