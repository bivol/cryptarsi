import { Component } from '@angular/core';
//import { AngularIndexedDB } from './cryptarsi/Storage';

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

  constructor() {
    // setInterval(() => { this.collection.push('xxx'); }, 2000);
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
