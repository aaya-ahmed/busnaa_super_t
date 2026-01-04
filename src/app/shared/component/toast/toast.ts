import { NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar'
@Component({
  selector: 'busnaa-toast',
  imports: [NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  constructor(@Inject(MAT_SNACK_BAR_DATA)public data:{
    type:'success'|'error'|'warning',
    message:string
  }){}

}
