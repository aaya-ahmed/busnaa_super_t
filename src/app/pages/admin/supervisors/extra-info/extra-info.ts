import { Component, input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import {  ISupervisorData } from '../../../../shared/model/supervisor';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltip } from "@angular/material/tooltip";
import { NgStyle } from '@angular/common';

@Component({
  selector: 'busnaa-extra-info',
  imports: [MatIcon, TranslatePipe, MatTooltip, NgStyle],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.scss',
})
export class ExtraInfo {
  supervisor=input<ISupervisorData|null>()

}
