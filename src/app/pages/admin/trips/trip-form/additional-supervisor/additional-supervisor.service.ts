import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdditionalSupervisorService {
  initialList:{
    name:string,
    key:string,
    mode:'M'|'E'|-1
  }[]=[];
}
