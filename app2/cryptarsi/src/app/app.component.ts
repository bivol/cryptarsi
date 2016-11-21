import { Component } from '@angular/core';
import { DB, DbList } from './cryptarsi/Database';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cryptarsi';
  collection: any = undefined;
    /*
  [
    {name: 'first', select: false},
    {name: 'two', select: false},
    {name: 'third', select: false}
  ];
    */
  databaseSelected = null;
  menuSelected = null;

  db: DB;

  constructor() {

    this.db = new DB('aa', 'enc');

    setInterval(() => { // TODO: to be converted into events instead of polling
      DbList.list().then((dbList: any) => {
        console.log('Database list is', dbList);
        this.collection = dbList.map((n) => {
          n.select = (n.name == this.databaseSelected) ? true : false;
          return n;
        });
      });
    }, 500);

    console.log('Try to open the db');
    this.db.open().then(() => {
      console.log('Both indexes are completed');
      this.db.addIndexToHash('pesho', Math.random() * 100)
        .then(() => {
          console.log('Successful index modification');
          this.db.getHash('pesho').then((v) => console.log('pesho is', v)).catch((e) => console.log('Error gethash',e));
        })
        .catch((e) => console.log('index error', e));
      /*
      this.db.modifyData(1, 'tralala')
        .then(() => {
          this.db.getData(1)
            .then((d) => console.log('data is', d))
            .catch((e) => console.log('gdata err', e));
        })
        .catch((e) => console.log('error', e));
        */
    }).catch(() => {
      console.log('Error');
    });
    /*
    this.db.createListDb().then(() => {
      console.log('ListDB created');
      this.db.addDatabase('pesho').then(() => {
        console.log('Pesho is added');
        this.db.getDatabase('pesho').then((x) => {
          console.log('Pesho is ',x);
          this.db.clearListDb().then(() => {
            console.log('The db list is clear');
          }).catch((e) => {
            console.log('Clear error',e);
          })
        }).catch((e) => {
          console.log('Pesho cannot be got');
        })
      }).catch((e) => {
        console.log('Pesho cannot be added',e);
        this.db.dropDatabase('pesho').then(() => {
          console.log('Pesho is dropped');
        }).catch((e) => {
          console.log('Pesho cannot be dropped',e);
        })
      })
    }).catch((e) => {
      console.log('ListDb cannot be created',e);
    })
    */

  }

  selectDatabase(name: string) {
    this.menuSelected = null;
    this.databaseSelected = name;
    this.collection.forEach((n) => {
      if (n.name === name) {
        n.select = true;
      } else {
        n.select = false;
      }
    });
  }
}
