import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cryptarsi';
  collection = ['first', 'two', 'third'];
  constructor() {
    // setInterval(() => { this.collection.push('xxx'); }, 2000);
  }
}
