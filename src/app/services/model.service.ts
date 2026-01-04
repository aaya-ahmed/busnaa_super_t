import {Injectable, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Modal } from '../shared/component/modal/modal';

@Injectable({ providedIn: 'root' })
export class ModelService {
  constructor(private matDialog:MatDialog) {}
  open(
    title: string,
    contentTemplate: any,
    data: any,
    width?:string
  ){
    this.matDialog.open(Modal, {
      width: width??'500px',
      data: {
        title: title,
        component: contentTemplate,
        inputs: data,
      }
    });
  }
}
