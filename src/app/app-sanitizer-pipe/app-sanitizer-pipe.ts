import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safe' })
export class AppSanitizerPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url): any {
    return <any>this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
