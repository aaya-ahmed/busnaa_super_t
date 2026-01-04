import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customdate',
  standalone: true
})
export class CustomdatePipe implements PipeTransform {

  transform(value:string, ...args: unknown[]): unknown {
    let _date = value;
    if(value){
      const dateRegx='((?:2|1)\\d{3}(?:-|\/)(?:(?:0[1-9])|(?:1[0-2]))(?:-|\/)(?:(?:0[1-9])|(?:[1-2][0-9])|(?:3[0-1]))(?:T|\\s)(?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9]))';
      if(new RegExp(dateRegx).test(_date)){
        _date = value.split('T')[0];
      }
      else{
        _date = value.replace(/‏/g,'');
        
        let match = _date.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
        
        if(match?.[0]){
          _date = match[0];
        }
      }
    }
    return _date;
  }

}
