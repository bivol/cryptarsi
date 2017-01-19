//import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { RouterModule, Routes } from '@angular/router';
//import { FormsModule } from '@angular/forms';
//import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { AppComponent } from './app.component';
import { AppCryptarsiModule } from './app-cryptarsi/app-cryptarsi.module';

/*
const appRoutes: Routes = [
  { path: 'import-dir', component:  AppImportDirComponent },
  { path: '', component: AppComponent },
  { path: '**', component: AppComponent }
];
*/

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
//    BrowserModule,
//    FormsModule,
//    HttpModule,
//    MaterialModule.forRoot(),
    AppCryptarsiModule,
//    RouterModule.forRoot(appRoutes)
  ],
//  entryComponents: [
//    AppDialogComponent
//  ],
//  providers: [AppDbService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
