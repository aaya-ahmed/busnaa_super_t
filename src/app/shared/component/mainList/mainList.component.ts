import { ChangeDetectionStrategy, ChangeDetectorRef, Component, input, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable, take } from 'rxjs';
import { SearchComponent } from '../search/search.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { labelsDto, rowKeysDto, actionsDto, NestedKey } from '../../model/List';
import { dataResponce, initialResponce } from '../../model/responce';
import { DynamicSwitchPipe } from '../../pipe/dynamic.pipe';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { PaginationComponent } from "../pagination/pagination.component";
@Component({
  selector: 'busnaa-main-list',
  templateUrl: './mainList.component.html',
  imports: [MatCardModule, MatIconModule, MatTooltipModule, TranslateModule, DynamicSwitchPipe, SkeletonComponent, CommonModule, MatSlideToggle, PaginationComponent, SearchComponent],
  styleUrls: ['./mainList.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainListComponent<T extends object> implements OnChanges {
  @Input() service: ((...rest: any) => Observable<dataResponce<T>>) | null = null;
  @Input() labels: labelsDto[] = [];
  @Input() rowKeys: rowKeysDto<T>[] = [];
  @Input() actions: actionsDto<T>[] = [];
  @Input() search: { key: string, type: string }[] = [];
  isProcessOpration = input<string>('');
  refresh = input<boolean>(false)
  searching: { key: string, value: string } = { key: '', value: '' };
  data: T[] = initialResponce.responce.data;
  loader: boolean = true;
  noData: boolean = false;
  page = {
    nextPage: '',
    prevPage: ''
  }
  constructor(private changeDetaction: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['service']?.firstChange) {
      this.loader = true;
      this.changeDetaction.detectChanges();
      this.getData();
    }
    if (changes['refresh']?.currentValue) {
      this.resetData()
      this.getData();
    }
  }
  resetData() {
    this.loader = true;
    this.data = [];
    this.noData = false
    this.changeDetaction.detectChanges();
  }
  getNestedValue(row: any, key?: NestedKey<T, "">): string {
    if (key)
      return key.split('?.').reduce((o, k) => (o ? o[k] : null), row);
    return ''
  }
  getData(startKey?: { value: string, key: string }) {
    if (this.service) {
      let watcher: Observable<dataResponce<T>>;
      if (this.searching.value) {
        watcher = this.service(startKey, this.searching.key, this.searching.value)
      } else if (startKey) {
        watcher = this.service(startKey)
      } else {
        watcher = this.service()
      }
      watcher.pipe(take(1)).subscribe({
        next: (responce: dataResponce<T>) => {
          console.log(responce)
          if (responce?.responce) {
            if (responce?.responce?.length > 0) {
              this.page = {
                ...this.page,
                nextPage: (responce.responce[responce.responce.length - 1] as any)?.key
              }
              this.data = responce.responce;
              this.noData = false;
            } else if (responce.responce.length === 0) {
              this.noData = true;
              this.data = [];
              this.page = {
                ...this.page,
                nextPage: ''
              }
            }
          }
          this.loader = false;
          this.changeDetaction.detectChanges();
        },
        error: () => {
          this.noData = true;
          this.loader = false;
          this.changeDetaction.detectChanges();
        }
      });
    }
  }
  searchChange(search: { key: string, value: string }) {
    this.searching = search;
    this.loader = true;
    this.changeDetaction.detectChanges();
    this.getData()
  }
  onChangePage(page: string) {
    this.page = {
      ...this.page,
      prevPage: (this.data[0] as any)?.key,
    }
    this.resetData();
    this.getData({ key: page, value: this.searching.value ?? '' })
  }
}
