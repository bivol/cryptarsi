import { Component } from '@angular/core';
import { DB } from './cryptarsi/Database';

import { AngularIndexedDB } from './cryptarsi/Storage';

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

    let db = new AngularIndexedDB('myDb', 1);
    console.log('db', db);
    db.createStore(1, (evt) => {
      let objectStore = evt.currentTarget.result.createObjectStore(
        'people', { keyPath: "id", autoIncrement: true });
      objectStore.createIndex("name", "name");
      objectStore.createIndex("email", "email");
      console.log('Should be ready');
    });

    setTimeout(()=>{
    db.add('people', { name: 'name', email: 'email' }).then(() => {
        // Do something after the value was added
        console.log('added');
      }, (error) => {
        console.log(error);
    });
    },1000);

    /*
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
    */

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
