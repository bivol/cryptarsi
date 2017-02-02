import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppCryptarsiModule } from './app-cryptarsi/app-cryptarsi.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppCryptarsiModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
