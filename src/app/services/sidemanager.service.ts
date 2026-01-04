import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
export type loaderType = { open: boolean , type : string , data : any , reLoad ?: boolean };
@Injectable({
  providedIn: 'root'
})
export class SidemanagerService {
  public currentQuery = { mode : 'over' , menuOpen : 'no'};
  private loaderSubject = new BehaviorSubject<loaderType>({ open: false , type : '' , data : null , reLoad : false });
  public _loader:Observable<loaderType>;

  constructor() {
    this._loader = this.loaderSubject.asObservable();
  }

  public get loader() {
    return this.loaderSubject.value;
  }

  load($val:loaderType){
    this.loaderSubject.next($val);
  }
}
