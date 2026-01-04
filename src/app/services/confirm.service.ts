import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Confirm } from '../shared/component/confirm/confirm';

@Injectable({ providedIn: 'root' })
export class ConfirmService {

  constructor(public dialog: MatDialog) {}
  show(config:{message: string,yesText?:string,noText?:string}) {
    const dialogRef=this.dialog.open(Confirm, {
      data: { message:config.message,
        yesText:config.yesText??'yes',
        noText:config.noText??'no'
       }
    });
    return dialogRef.afterClosed();
  }
}
