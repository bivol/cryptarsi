import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppCryptarsiComponent } from './app-cryptarsi.component';
import { AppImportDirComponent } from '../app-import-dir/app-import-dir.component';
import { AppImportDbComponent } from '../app-import-db/app-import-db.component';
import { AppSearchPageComponent } from '../app-search-page/app-search-page.component';
import { AppDialogComponent } from '../app-dialog/app-dialog.component';
import { AppSearchLineComponent } from '../app-search-line/app-search-line.component';
import { AppViewFileComponent } from '../app-view-file/app-view-file.component';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { Ng2PaginationModule } from 'ng2-pagination';
import { AppSanitizerPipe } from '../app-sanitizer-pipe/app-sanitizer-pipe';
import { AppDbService } from '../app-db-service/app-db-service';
import { MaterialModule } from '@angular/material';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
        Ng2PaginationModule,
    ],
    declarations: [
        AppCryptarsiComponent,
        AppImportDirComponent,
        AppImportDbComponent,
        AppSearchPageComponent,
        AppSearchLineComponent,
        AppViewFileComponent,
        AppDialogComponent,
        AppSanitizerPipe,
        PdfViewerComponent
    ],
    entryComponents: [
        AppDialogComponent
    ],
    providers: [AppDbService],
    bootstrap: [AppCryptarsiComponent],
    exports: [AppCryptarsiComponent]
})
export class AppCryptarsiModule {
}
