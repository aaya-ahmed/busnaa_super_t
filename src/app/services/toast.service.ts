import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Toast } from '../shared/component/toast/toast';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}
  show(type: 'success' | 'warning' | 'error', message: string) {
    this.snackBar.openFromComponent(Toast, {
      data: { type, message },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['no-padding-snackbar']
    });
  }
}
