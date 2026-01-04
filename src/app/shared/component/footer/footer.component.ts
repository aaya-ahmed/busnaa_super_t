import { Component, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'busnaa-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports:[TranslatePipe]
})
export class FooterComponent implements OnInit {
  languages = {
    'ar' : { title : 'العربيه' , dir : 'rtl'},
    'en' : { title : 'English' , dir : 'ltr'}
  };
  languagesArray:(keyof typeof this.languages)[] = ['ar', 'en'];
  constructor(public translate:TranslateService) { }

  ngOnInit(): void {
  }
  switchLang(event:Event){
    if(!event || !event.target) return;
    window.localStorage.setItem('page-dir',this.languages[(event.target as HTMLSelectElement).value as ('ar'|'en')].dir);
    window.localStorage.setItem('page-lang',(event.target as HTMLSelectElement).value);
    window.location.reload();
  }
}
