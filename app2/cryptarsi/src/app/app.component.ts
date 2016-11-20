import { Component } from '@angular/core';
import { DB, DbList } from './cryptarsi/Database';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cryptarsi';
  collection = [
    {name: 'first', select: false},
    {name: 'two', select: false},
    {name: 'third', select: false}
  ];
  databaseSelected = null;
  menuSelected = null;

  db: DB;

  constructor() {

    this.db = new DB('aa','enc');

    DbList.list().then((dbList) => {
      console.log('Database list is', dbList);
    });

    this.db.open().then(() => {
      console.log('Both indexes are completed')
    }).catch(() => {
      console.log('Error');
    })
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
