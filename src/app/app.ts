import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Busnaa';
  constructor(
     private titleService:Title , public translate:TranslateService 
    ){
    translate.addLangs(['ar' , 'en']);
    translate.use(window.localStorage.getItem('page-lang') || 'en');
    translate.setFallbackLang(window.localStorage.getItem('page-lang') || 'en');
    this.titleService.setTitle(`${this.title}`);
    }


}
