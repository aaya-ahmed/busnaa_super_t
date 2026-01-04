import { NgComponentOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'busnaa-modal',
  imports: [TranslatePipe, MatDialogModule, NgComponentOutlet,MatButton],
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  data = inject<{
    title: string,
    component: any,
    inputs: any,
  }>(MAT_DIALOG_DATA)
  constructor(public dialogRef: MatDialogRef<Modal>) { }
  closemodal() {
    this.dialogRef.close()
  }
}
