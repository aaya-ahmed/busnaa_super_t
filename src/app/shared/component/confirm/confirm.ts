import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'busnaa-confirm',
  imports: [TranslatePipe, MatButton],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss',
})
export class Confirm {
  data=inject<{message: string,yesText?:string,noText?:string}>(MAT_DIALOG_DATA);
  dialogRef=inject(MatDialogRef<Confirm>)
  constructor(){}
  close(result:boolean){
    this.dialogRef.close(result)
  }
}
