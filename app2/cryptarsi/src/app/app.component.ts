import { Component } from '@angular/core';
import { DB } from './cryptarsi/Database';

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

    this.db.createListDb().then(() => {
      console.log('ListDB created');
      this.db.addDatabase('pesho').then(() => {
        console.log('Pesho is added');
      }).catch((e) => {
        console.log('Pesho cannot be added',e);
      })
    }).catch((e) => {
      console.log('ListDb cannot be created',e);
    })

    /*
    this.db.clearListDb().then(() => {
      this.db.createListDb().then(() => {
        console.log('listDb is created');
        this.db.addDatabase('pesho').then(() => {
          console.log('1 Pesho is added');
        }).catch(() => {
          console.log('1 Pesho is not added');
        })
      }).catch(() => {
        console.log('listDb cannot be created');
        this.db.addDatabase('pesho').then(() => {
          console.log('2 Pesho is added');
        }).catch(() => {
          console.log('2 Pesho is not added');
        })
      })
    }).catch(() => {
      console.log('Cant clear the listDb');
        this.db.addDatabase('pesho').then(() => {
          console.log('3 Pesho is added');
        }).catch((e) => {
          console.log('3 Pesho is not added',e);
        })
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
