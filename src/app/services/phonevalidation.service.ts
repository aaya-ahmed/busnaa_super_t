import { Injectable } from '@angular/core';
import config from '../../../public/phones.json'
@Injectable({
  providedIn: 'root'
})
export class PhonevalidationService {
  private countrycode:string=(localStorage.getItem('busnaa_school') ? JSON.parse(localStorage.getItem('busnaa_school') || '').countryCode??'+20':'').replace(/^\D+/g, '');
  private codeindex:number;
  constructor() {
    this.codeindex=config.findIndex(ele=>ele.country_code==this.countrycode)
   }
  phoneValidator(value: string): boolean {
      if(value&&this.codeindex!=-1){
          for(let i=0;i<config[this.codeindex].lengths.length;i++){
              if(config[this.codeindex].lengths[i]==`${value}`.length)
                return true
          }
          return false;
      }
      return false;
}
}
