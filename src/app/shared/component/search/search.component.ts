import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY'
  },
};


@Component({
  selector: 'busnaa-search',
  templateUrl: './search.component.html',
  imports: [CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    TranslateModule,
    MatInputModule,
    FormsModule],
  styleUrls: ['./search.component.scss'],
  // providers: [
  //   {
  //     provide: DateAdapter,
  //     useClass: MomentDateAdapter,
  //     deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
  //   },
  //   { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  // ],
})
export class SearchComponent implements OnInit {
  @Input('seachKeys') searchctrl: { key: string, type: string }[] = [];
  @Output() searchValue: EventEmitter<{ key: string, value: string }> = new EventEmitter<{ key: string, value: string }>();
  searchctrlvalue: { key: string, type: string } = { key: '', type: 'text' };
  searchvalue: string  = '';
  searchTextUpdate = new Subject<any>();
  constructor() {
  }
  ngOnInit(): void {
    this.searchTextUpdate.pipe(
      debounceTime(600),
      distinctUntilChanged())
      .subscribe(value => {
        this.searchvalue = value;
        this.searchValue.emit({ value: typeof value != 'string' ? value.format('YYYY-MM-DD') : value, key: this.searchctrlvalue.key });
        return;
      });
    if (this.searchctrl.length == 1) {
      this.searchctrlvalue = this.searchctrl[0]
      // this.searchvalue = this.searchctrlvalue.key == 'date' ? moment() : '';
    }
  }
  changectrl($event:any) {
    this.searchctrlvalue = $event
    // this.searchvalue = $event.key == 'date' ? moment() : '';
  }
}
