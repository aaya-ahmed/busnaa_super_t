import { Component, input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltip } from "@angular/material/tooltip";
import { NgStyle } from '@angular/common';
import { IParentData } from '../../../../shared/model/parent';

@Component({
  selector: 'busnaa-extra-info',
  imports: [MatIcon, TranslatePipe, MatTooltip, NgStyle],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.scss',
})
export class ExtraInfo {
  parent=input<IParentData|null>()

}
