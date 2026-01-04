import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notnan',
  standalone: true
})
export class NotnanPipe implements PipeTransform {

  transform(value:any, ...args: unknown[]): unknown {
    return isNaN(parseFloat(value)) ? '-' : value;
  }

}
