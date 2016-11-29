import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { AppComponent } from './app.component';
import { AppImportDirComponent } from './app-import-dir/app-import-dir.component';
import { AppImportDbComponent } from './app-import-db/app-import-db.component';
import { AppSearchPageComponent } from './app-search-page/app-search-page.component';
import { AppDialogComponent } from './app-dialog/app-dialog.component';
import { AppSearchLineComponent } from './app-search-line/app-search-line.component';
import { AppViewFileComponent } from './app-view-file/app-view-file.component';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { Ng2PaginationModule } from 'ng2-pagination';

@NgModule({
  declarations: [
    AppComponent,
    AppImportDirComponent,
    AppImportDbComponent,
    AppSearchPageComponent,
    AppSearchLineComponent,
    AppViewFileComponent,
    AppDialogComponent,
    PdfViewerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2PaginationModule,
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
