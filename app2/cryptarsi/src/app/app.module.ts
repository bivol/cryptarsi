import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { AppComponent } from './app.component';
import { ImportDirComponent } from './import-dir/import-dir.component';
import { AppSearchPageComponent } from './app-search-page/app-search-page.component';
import { AppDialogComponent } from './app-dialog/app-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    ImportDirComponent,
    AppSearchPageComponent,
    AppDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot()
  ],
  entryComponents: [
    AppDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
